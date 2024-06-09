import { 
  CustomResource,
  aws_iam as iam,
  custom_resources as cr, aws_lambda as lambda, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";


export class StringFuncs extends Construct {
  private readonly rsrc: CustomResource;

  get lowerCase(): string {
    return this.rsrc.getAttString("Lower");
  }
  get upperCase(): string {
    return this.rsrc.getAttString("Upper");
  }
  get parentDomain(): string {
    return this.rsrc.getAttString("ParentDomain");
  }

  constructor(parent: Construct, name: string, str: string) {
    super(parent, name);

    const provider = StrFuncsProvider.getOrCreate(this);
    this.rsrc = new CustomResource(this, "EndpointArnCustomResource", {
      properties: {
        str: str,
      },
      serviceToken: provider.serviceToken,
    });
  }
}

class StrFuncsProvider extends Construct {
  public static getOrCreate(scope: Construct) {
    const stack = Stack.of(scope);
    const id = 'str-funcs-provider';
    const pConstruct =
      (stack.node.tryFindChild(id) as StrFuncsProvider) ||
      new StrFuncsProvider(stack, id);
    return pConstruct.provider;
  }
 
  public readonly provider: cr.Provider;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const fRole = new iam.Role(this, 'StrFuncRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
      const f = new lambda.SingletonFunction(this, "StrFuncsFunction", {
        uuid: "str-funcs",
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        role: fRole,
        code: lambda.Code.fromInline(`exports.handler = async (event) => {
          const s = event.ResourceProperties.str;
          const domainParts = s.split('.');
          const parentDomain = domainParts.length <= 1 ? s : s.split('.').slice(1).join('.');
          
    return {
      PhysicalResourceId: event.PhysicalResourceId,
      Data: {
        Lower: s.toLowerCase(),
        Upper: s.toUpperCase(),
        ParentDomain: parentDomain
      },
    };
  }`),
      }); 
    this.provider = new cr.Provider(this, "StrFuncsProvider", {
      onEventHandler: f,
    })
  }
}