package workflow

import (
	"encoding/json"
	"fmt"
	"github.com/HitchPin/maestro/bootstrapping-workflow/configuration"
	"github.com/HitchPin/maestro/bootstrapping-workflow/workflow/environment"
	"github.com/HitchPin/maestro/bootstrapping-workflow/workflow/events"
	eventTypes "github.com/HitchPin/maestro/common/events"
	"github.com/pterm/pterm"
)

func RunBootstrapClusterWorkflow(exConf configuration.ExecutionConfiguration) error {

	logger := pterm.DefaultLogger.WithLevel(pterm.LogLevelTrace)
	spinner1, _ := pterm.DefaultSpinner.Start("Discovering resources in the AWS environment...")
	workflowExecutionEnv, err := environment.DiscoverEnvironment(exConf)
	spinner1.Success("Completed environment discovery!")

	if err != nil {
		return err
	}

	pterm.DefaultHeader.WithFullWidth().Println("Node Roles and Auto Scaling Groups")
	pterm.Println()
	err = workflowExecutionEnv.AsgsByRole.PrintTable()
	if err != nil {
		return err
	}

	err = workflowExecutionEnv.RunSafetyChecks()
	if err != nil {
		logger.Error(fmt.Sprintf("Safety checks failed!:\n%s", err))
		return err
	}

	pterm.DefaultSection.Println("Launching bootstrapping node...")
	err = launchNodesWithRole(exConf, *workflowExecutionEnv, *workflowExecutionEnv.AsgsByRole.Bootstrapping, 1)
	if err != nil {
		return err
	}

	pterm.DefaultSection.Println("Launching dedicated manager nodes...")
	err = launchNodesWithRole(exConf, *workflowExecutionEnv, *workflowExecutionEnv.AsgsByRole.ClusterManager, 3)
	if err != nil {
		return err
	}

	pterm.DefaultSection.Println("Launching data nodes...")
	err = launchNodesWithRole(exConf, *workflowExecutionEnv, *workflowExecutionEnv.AsgsByRole.Data, 3)
	if err != nil {
		return err
	}

	pterm.DefaultSection.Println("Setting cluster mode to launched!")
	err = workflowExecutionEnv.SetClusterModeToLaunched()
	if err != nil {
		return err
	}

	err = workflowExecutionEnv.AsgsByRole.Bootstrapping.SetDesiredRoleCapacity(0)
	if err != nil {
		return err
	}

	rasgsToRefresh := workflowExecutionEnv.AsgsByRole.AllExceptBootstrap()
	for _, rasg := range rasgsToRefresh {
		err = rasg.StartRollingRefresh()
		if err != nil {
			logger.Error(fmt.Sprintf("Failed to start rolling refresh for asg role %s.", rasg.Role))
		}
	}

	return nil
}

func launchNodesWithRole(exConf configuration.ExecutionConfiguration, workflowExecutionEnv environment.DiscoveredEnvironment, roleAsg environment.RoleAsg, nodeCount int) error {

	roleName := roleAsg.Role
	logger := pterm.DefaultLogger.WithLevel(pterm.LogLevelTrace)
	var err error

	capAdjustmentSpinner, _ := pterm.DefaultSpinner.Start(
		fmt.Sprintf("Setting %s ASG to a desired capacity of %v.", roleName, nodeCount))
	err = roleAsg.SetDesiredRoleCapacity(nodeCount)
	if err != nil {
		capAdjustmentSpinner.Fail(err)
		return err
	}
	capAdjustmentSpinner.Success(fmt.Sprintf("Launched %v %s node(s)!", nodeCount, roleName))

	isForMyRole := func(le events.LogEvent) bool {

		if nodeRole, ok := le.Detail["maestro-role"]; ok {
			nodeRoleStr := nodeRole.(string)
			return nodeRoleStr == roleName
		}

		leJson, _ := json.Marshal(le)

		fmt.Printf("Got this log event, couldn't find maestro-role in detail:\n%s\n", string(leJson))
		return false
	}

	matcher := func(le events.LogEvent) events.EventMatchResult {
		if le.DetailType == eventTypes.NodeInitializedAndRegistered && isForMyRole(le) {
			return events.Match
		} else if le.DetailType == eventTypes.NodeInitFailed && isForMyRole(le) {
			return events.Abort
		}
		return events.Pass
	}
	multiNodeMatcher := events.NewMultiNodeTracker(matcher, nodeCount)

	waitForBootstrapLaunchSpinner, _ := pterm.DefaultSpinner.Start(fmt.Sprintf("Waiting for %v %s nodes to initialize...", nodeCount, roleName))
	_, err = events.WaitForEventCondition(exConf.Cloud.AwsConf, exConf.EventsLogGroup, multiNodeMatcher.Match)
	if err != nil {
		waitForBootstrapLaunchSpinner.Fail(fmt.Sprintf("Something went wrong while waiting for the %s node.", roleName))
		logger.Error(fmt.Sprintf("Unable to verify bootstrap node initialization.\n%s", err))

		failures := multiNodeMatcher.GetFailures()
		for _, f := range failures {
			f.Log(logger)
		}

		return err
	}
	waitForBootstrapLaunchSpinner.Success(fmt.Sprintf("%v %s nodes successfully started!", nodeCount, roleName))

	matches := multiNodeMatcher.GetMatches()
	for _, m := range matches {
		m.Log(logger)
	}
	pterm.Println()
	pterm.Println()

	return nil
}
