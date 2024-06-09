import {
  aws_lambda as lambda,
  aws_apigateway as apig,
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as fs from "fs";
import { fromParams } from "../common";

interface ApiEndpointProps {
  func: lambda.Function;
}

export class ApiEndpoint extends Construct {
  readonly maestroInvokePolicy: iam.ManagedPolicy;
  readonly apiEndpoint: string;

  constructor(parent: Construct, name: string, props: ApiEndpointProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const apigRole = new iam.Role(this, "ApigLoggingRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonAPIGatewayPushToCloudWatchLogs"
        ),
      ],
    });
    const account = new apig.CfnAccount(this, "Account", {
      cloudWatchRoleArn: apigRole.roleArn,
    });
    const api = new apig.RestApi(this, "Api", {
      restApiName: names.hyphenatedPrefix + `Maestro`,
      deployOptions: {
        dataTraceEnabled: true,
        loggingLevel: apig.MethodLoggingLevel.INFO,
      },
    });
    const integrationForPath = (p: string) =>
      new apig.LambdaIntegration(props.func, {
        proxy: true,
      });
    (
      api.latestDeployment!.node.defaultChild as apig.CfnDeployment
    ).addDependency(account);

    const certs = api.root.addResource("certificates");
    const issue = certs.addResource("issue");
    const issueCert = issue.addMethod(
      "POST",
      integrationForPath("/certificates/issue"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );
    const root = certs.addResource("root");
    const getCaCert = root.addMethod(
      "GET",
      integrationForPath("/certificates/root"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );

    const conf = api.root.addResource("configuration");
    const osConf = conf.addResource("opensearch");
    const specializeOsConf = osConf.addMethod(
      "POST",
      integrationForPath("/configuration/opensearch"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );

    const cwagentConf = conf.addResource("cwagent");
    const specializeCwAgentConf = cwagentConf.addMethod(
      "POST",
      integrationForPath("/configuration/cwagent"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );

    const register = api.root.addResource("register");
    const registerInstance = register.addMethod(
      "POST",
      integrationForPath("/register"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );

    const cluster = api.root.addResource("cluster");
    const curl = cluster.addResource("curl");
    const curlCluster = curl.addMethod(
      "POST",
      integrationForPath("/cluster/curl"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );

    const signal = api.root.addResource("signal");
    const initFail = signal.addResource("init-fail");
    const signalInitFail = initFail.addMethod(
      "POST",
      integrationForPath("/signal/init-fail"),
      {
        authorizationType: apig.AuthorizationType.IAM,
      }
    );

    const smallPolicy = (r: string) => {
      return new iam.PolicyStatement({
        resources: [r],
        actions: [`execute-api:Invoke`],
      });
    };
    const getCaCertPolicy = smallPolicy(getCaCert.methodArn);
    const issueCertPolicy = smallPolicy(issueCert.methodArn);
    const specializeOsConfPolicy = smallPolicy(specializeOsConf.methodArn);
    const specializeCwAgentConfPolicy = smallPolicy(
      specializeCwAgentConf.methodArn
    );;
    const registerInstancePolicy = smallPolicy(registerInstance.methodArn);
    const curlClusterPolicy = smallPolicy(curlCluster.methodArn);
    const signalInitFailPolicy = smallPolicy(signalInitFail.methodArn);
    this.maestroInvokePolicy = new iam.ManagedPolicy(this, "Policy", {
      statements: [
        getCaCertPolicy,
        issueCertPolicy,
        specializeOsConfPolicy,
        specializeCwAgentConfPolicy,
        registerInstancePolicy,
        curlClusterPolicy,
        signalInitFailPolicy,
      ],
    });;
    this.apiEndpoint = api.deploymentStage.urlForPath();
  }
}
