import { Construct } from "constructs";
import {
  aws_ssm as ssm,
  aws_iam as iam,
  aws_lambda as lambda,
  custom_resources as cr,
  CustomResource,
} from "aws-cdk-lib";
import * as path from 'path';
import * as fs from 'fs';


const getHandler = (): string => {
    const pyPath = path.join(path.resolve(__dirname), "./internal/param_linker.py");
    return fs.readFileSync(pyPath).toString('utf8');
}

interface ParamLinkProps {
    amiId: string,
    stringParam: ssm.IStringParameter
}

export class ParamLink extends Construct {

    constructor(parent: Construct, name: string, props: ParamLinkProps) {
        super(parent, name);


        const r = new iam.Role(this, "Role", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          inlinePolicies: {
            paramUpdate: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  actions: ["ssm:PutParameter"],
                  resources: [props.stringParam.parameterArn],
                }),
                new iam.PolicyStatement({
                  actions: ["ec2:DescribeImages"],
                  resources: ['*']
                }),
              ],
            }),
          },
        });
      const f = new lambda.Function(this, "Func", {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "index.on_event",
        code: lambda.Code.fromInline(getHandler()),
        role: r,
      }); 
        const provider = new cr.Provider(this, "Provider", {
            
            onEventHandler: f,
        });
        new CustomResource(this, "CustomResource", {
            properties: {
                AmiId: props.amiId,
                ParameterName: props.stringParam.parameterName
            },
            serviceToken: provider.serviceToken,
        });
    }
}