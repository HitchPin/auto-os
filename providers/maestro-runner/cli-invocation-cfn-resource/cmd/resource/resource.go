package resource

import (
	"fmt"
	"github.com/aws-cloudformation/cloudformation-cli-go-plugin/cfn/handler"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/codebuild"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/davecgh/go-spew/spew"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v2"
	"io"
	"log"
	"strings"
)

// Create handles the Create event from the Cloudformation service.
func Create(req handler.Request, prevModel *Model, model *Model) (handler.ProgressEvent, error) {

	if req.CallbackContext == nil {
		return startBuild(req, model)
	}
	return updateBuild(req, prevModel, model)
}

func updateBuild(req handler.Request, prevModel *Model, model *Model) (handler.ProgressEvent, error) {

	buildId := req.CallbackContext["BUILD_ID"].(string)
	cbClient := codebuild.New(req.Session)
	bRes, err := cbClient.BatchGetBuilds(&codebuild.BatchGetBuildsInput{
		Ids: []*string{
			&buildId,
		},
	})
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrapf(err, "Failed to get build with id %s", buildId)
	}
	build := bRes.Builds[0]
	status := *build.BuildStatus
	if status == "SUCCEEDED" {
		return getResult(req, prevModel, model, *build)
	} else if status == "FAILED" || status == "FAULT" || status == "TIMED_OUT" || status == "STOPPED" || status == "FAILED_WITH_ABORT" {
		return handler.ProgressEvent{
			OperationStatus: handler.Failed,
			Message:         fmt.Sprintf("Build finished in bad state: %s", status),
			ResourceModel:   model,
			CallbackContext: nil,
		}, nil
	} else if status == "IN_PROGRESS" {
		phase := *build.CurrentPhase
		return handler.ProgressEvent{
			OperationStatus: handler.InProgress,
			Message:         fmt.Sprintf("Build ongoing. Currently in phase %s", phase),
			ResourceModel:   model,
			CallbackContext: req.CallbackContext,
		}, nil
	} else {
		return handler.ProgressEvent{
			OperationStatus: handler.Failed,
			Message:         fmt.Sprintf("Build finished with unknown state: %s", status),
			ResourceModel:   model,
			CallbackContext: nil,
		}, nil
	}
}

func getCommandOutput(awsSession session.Session, buildId string) (*string, error) {
	cbClient := codebuild.New(&awsSession)
	bRes, err := cbClient.BatchGetBuilds(&codebuild.BatchGetBuildsInput{
		Ids: []*string{
			&buildId,
		},
	})
	if err != nil {
		return nil, errors.Wrapf(err, "Failed to get build with id %s", buildId)
	}
	build := bRes.Builds[0]
	loc := *build.Artifacts.Location
	locParts := strings.Split(loc, "/")
	bucketParts := strings.Split(locParts[0], ":")
	bucketName := bucketParts[len(bucketParts)-1]
	key := strings.Join(locParts[1:], "/") + "/result.txt"
	s3Client := s3.New(&awsSession)
	objRes, err := s3Client.GetObject(&s3.GetObjectInput{
		Bucket: &bucketName,
		Key:    &key,
	})
	if err != nil {
		return nil, errors.Wrapf(err, "Unable to get object in bucket %s with key %s.", bucketName, key)
	}
	respBytes, err := io.ReadAll(objRes.Body)
	respStr := string(respBytes)
	return &respStr, nil
}

func getResult(req handler.Request, prevModel *Model, model *Model, build codebuild.Build) (handler.ProgressEvent, error) {

	cmdOutput, err := getCommandOutput(*req.Session, *build.Id)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrapf(err, "Unable to get command output.")
	}
	model.CommandOutput = cmdOutput
	model.InvocationId = build.Id
	log.Printf("Command output: %s", *cmdOutput)
	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "Completed CodeBuild invocation.",
		ResourceModel:   model,
		CallbackContext: nil,
	}, nil
}

func startBuild(req handler.Request, model *Model) (handler.ProgressEvent, error) {

	cbClient := codebuild.New(req.Session)
	substrateParamEnvVar := "HYDRATION_SUBSTRATE"
	controlPlaneParamEnvVar := "HYDRATION_CONTROLPLANE"
	cliCommandEnvVar := "MAESTRO_CLI_CMD"

	envVarType := codebuild.EnvironmentVariableTypePlaintext

	bs, err := yaml.Marshal(map[string]interface{}{
		"version": 0.2,
		"phases": map[string]interface{}{
			"build": map[string]interface{}{
				"on-failure": "ABORT",
				"commands": []interface{}{
					/*
						"echo \"Access Key: $AWS_ACCESS_KEY_ID\"",
						"echo \"Secret Key: $AWS_SECRET_ACCESS_KEY\"",
						"echo \"Session Token: $AWS_SESSION_TOKEN\"", */
					"touch .hp-maestro.yaml",
					"maestro-admin config hydrate --substrateParam \"$HYDRATION_SUBSTRATE\" --controlPlaneParam \"$HYDRATION_CONTROLPLANE\" --useImmediately",
					"cat .hp-maestro.yaml",
					"maestro-admin $MAESTRO_CLI_CMD > result.txt",
				},
			},
		},
		"artifacts": map[string]interface{}{
			"files": []interface{}{
				"result.txt",
			},
		},
	})
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Failed to serialize custom buildspec.yml.")
	}

	bsStr := string(bs)
	res, err := cbClient.StartBuild(&codebuild.StartBuildInput{
		ProjectName:         model.ProjectName,
		ServiceRoleOverride: model.RoleArn,
		BuildspecOverride:   &bsStr,
		EnvironmentVariablesOverride: []*codebuild.EnvironmentVariable{
			{
				Name:  &cliCommandEnvVar,
				Type:  &envVarType,
				Value: model.CliCommand,
			},
			{
				Name:  &substrateParamEnvVar,
				Type:  &envVarType,
				Value: model.Hydration.SubstrateParamName,
			},
			{
				Name:  &controlPlaneParamEnvVar,
				Type:  &envVarType,
				Value: model.Hydration.ControlPlaneParamName,
			},
			/*{
				Name:  &dataPlaneParamEnvVar,
				Type:  &envVarType,
				Value: model.Hydration.DataPlaneParamName,
			},*/
		},
	})
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Not able to start codebuild project build.")
	}

	model.InvocationId = res.Build.Id
	return handler.ProgressEvent{
		OperationStatus: handler.InProgress,
		ResourceModel:   model,
		CallbackContext: map[string]interface{}{
			"BUILD_ID": res.Build.Id,
		},
	}, nil
}

// Read handles the Read event from the Cloudformation service.
func Read(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	buildId := currentModel.InvocationId
	cmdOutput, err := getCommandOutput(*req.Session, *buildId)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrapf(err, "Unable to get command output.")
	}

	currentModel.CommandOutput = cmdOutput
	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		ResourceModel:   currentModel,
	}, nil
}

// Update handles the Update event from the Cloudformation service.
func Update(req handler.Request, prevModel *Model, newModel *Model) (handler.ProgressEvent, error) {
	log.Printf("Received update request!")
	log.Printf("Prev model: \n%s\n", spew.Sdump(*prevModel))
	log.Printf("New model: \n%s\n", spew.Sdump(*newModel))
	return handler.ProgressEvent{}, errors.New("Not implemented: Update")
}

// Delete handles the Delete event from the Cloudformation service.
func Delete(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {
	log.Printf("Received delete request!")
	return handler.ProgressEvent{
		OperationStatus: handler.Success,
	}, nil
}

// List handles the List event from the Cloudformation service.
func List(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {
	log.Printf("Received list request!")

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "List Complete",
		ResourceModel:   currentModel,
	}, nil
}
