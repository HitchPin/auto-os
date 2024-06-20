import {
    aws_lambda as lambda,
    aws_apigateway as apig,
    aws_iam as iam,
    aws_certificatemanager as acm,
    aws_route53 as r53,
    aws_route53_targets as r53targets,
    App,
    Stack,
    Environment,
    Duration,
  } from "aws-cdk-lib";
  import { Construct } from "constructs";
  import * as path from "path";
  import * as fs from "fs";
  
  interface AdmiralApiEndpointProps {
    func: lambda.Function;
    zone: r53.IPublicHostedZone
  }
  
  export class AdmiralApiEndpoint extends Construct {
    readonly admiralInvokePolicy: iam.ManagedPolicy;
    readonly apiEndpoint: string;
  
    constructor(parent: Construct, name: string, props: AdmiralApiEndpointProps) {
      super(parent, name);
  
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
        restApiName: `AdmiralApi`,
        deployOptions: {
          dataTraceEnabled: true,
          loggingLevel: apig.MethodLoggingLevel.INFO,
        },
        endpointTypes: [
          apig.EndpointType.REGIONAL
        ]
      });

      const cert = new acm.Certificate(this, 'Cert', {
        domainName:  `api.${props.zone.zoneName}`,
        validation: acm.CertificateValidation.fromDns(props.zone)
      })
      const domain = api.addDomainName('CustomDomain', {
        domainName: `api.${props.zone.zoneName}`,
        endpointType: apig.EndpointType.REGIONAL,
        certificate: cert
      });
      const integrationForPath = (p: string) =>
        new apig.LambdaIntegration(props.func, {
          proxy: true
        });
      (
        api.latestDeployment!.node.defaultChild as apig.CfnDeployment
      ).addDependency(account);
  
      const tenants = api.root.addResource("tenants");
      const createTenant = tenants.addMethod(
        "PUT",
        integrationForPath("/tenants"),
        {
          authorizationType: apig.AuthorizationType.IAM,
        }
      );
      const listTenants= tenants.addMethod(
        "GET",
        integrationForPath("/tenants"),
        {
          authorizationType: apig.AuthorizationType.IAM,
        }
      );
      const tenantName = tenants.addResource('{tenantName}');
      const tenantNameIntegration = new apig.LambdaIntegration(props.func, {
        proxy: true,
        requestParameters: {
            "integration.request.path.tenantName": "method.request.path.tenantName"
        },
        //timeout: Duration.minutes(5)
      });
      const tenantNameMethodOps: apig.MethodOptions = {
        authorizationType: apig.AuthorizationType.IAM,
        requestParameters: {
          "method.request.path.tenantName": true,
        },
      };
      const getTenant = tenantName.addMethod(
        "GET",
        tenantNameIntegration,
        tenantNameMethodOps
      );

      const deleteTenant = tenantName.addMethod(
        "DELETE",
        tenantNameIntegration,
        tenantNameMethodOps
      );

      const projects = tenantName.addResource('projects');
      const createProject = projects.addMethod(
        "PUT",
        tenantNameIntegration,
        tenantNameMethodOps
      );
      const listProjects = projects.addMethod(
        "GET",
        tenantNameIntegration,
        tenantNameMethodOps
      );

      const projectName = projects.addResource('{projectName}');
      const projectNameIntegration = new apig.LambdaIntegration(props.func, {
        proxy: true,
        requestParameters: {
            "integration.request.path.tenantName": "method.request.path.tenantName",
            "integration.request.path.projectName": "method.request.path.projectName"
        },
        //timeout: Duration.minutes(5)
      });
      const projectNameMethodOps: apig.MethodOptions = {
        authorizationType: apig.AuthorizationType.IAM,
        requestParameters: {
          "method.request.path.projectName": true,
          "method.request.path.tenantName": true,
        },
      };
      const getProject = projectName.addMethod(
        "GET",
        projectNameIntegration,
        projectNameMethodOps
      );

      const smallPolicy = (r: string) => {
        return new iam.PolicyStatement({
          resources: [r],
          actions: [`execute-api:Invoke`],
        });
      };
      const createTenantPolicy = smallPolicy(createTenant.methodArn);
      const listTenantsPolicy = smallPolicy(listTenants.methodArn);
      const getTenantPolicy = smallPolicy(getTenant.methodArn);
      const deleteTenantPolicy = smallPolicy(deleteTenant.methodArn);
      const createProjectPolicy = smallPolicy(createProject.methodArn);
      const listProjectsPolicy = smallPolicy(listProjects.methodArn);
      const getProjectPolicy = smallPolicy(getProject.methodArn);

      this.admiralInvokePolicy = new iam.ManagedPolicy(this, "Policy", {
        statements: [
            createTenantPolicy,
            listTenantsPolicy,
            getTenantPolicy,
            deleteTenantPolicy,
            createProjectPolicy,
            listProjectsPolicy,
            getProjectPolicy
        ],
      });;

      new r53.ARecord(this, 'ARecord', {
        zone: props.zone,
        recordName: 'api',
        target: r53.RecordTarget.fromAlias(new r53targets.ApiGatewayDomain(domain))
      })
      
      this.apiEndpoint = api.deploymentStage.urlForPath();
    }
  }
  