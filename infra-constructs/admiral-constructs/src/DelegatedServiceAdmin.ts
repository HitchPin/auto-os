import { Construct } from 'constructs';
import { custom_resources as cr } from 'aws-cdk-lib';

const ServicesLookup = {
    AccountManagement: "account.amazonaws.com",
    CloudTrail: "cloudtrail.amazonaws.com",
    Config: "config.amazonaws.com",
    Health: "health.amazonaws.com",
    Inspector: "inspector2.amazonaws.com",
    FirewallManager: "fms.amazonaws.com",
    ResourceExplorer: "resource-explorer-2.amazonaws.com",
    StackSets: "stacksets.cloudformation.amazonaws.com",
    SSO: "sso.amazonaws.com",
    ServiceCatalog: "servicecatalog.amazonaws.com",
    SystemsManager: "ssm.amazonaws.com",
    TagPolicies: "tagpolicies.tag.amazonaws.com",
  } as const;
  
export type Service = keyof typeof ServicesLookup;

interface DelegatedServiceAdminProps {
    service: Service,
    accountId: string
}

export class DelegatedServiceAdmin extends Construct {

    constructor(parent: Construct, name: string, props: DelegatedServiceAdminProps) {
        super(parent, name);

        new cr.AwsCustomResource(this, 'RuleSetActivator', {
            onCreate: {
              service: 'Organizations',
              action: 'RegisterDelegatedAdministrator',
              parameters: {
                AccountId: props.accountId,
                ServicePrincipal: ServicesLookup[props.service]
              },
              physicalResourceId: cr.PhysicalResourceId.of(`${props.service}${props.accountId}`),
            },
            onDelete: {
                service: 'Organizations',
                action: 'DeregisterDelegatedAdministrator',
                parameters: {
                  AccountId: props.accountId,
                  ServicePrincipal: ServicesLookup[props.service]
                },
                physicalResourceId: cr.PhysicalResourceId.of(`${props.service}${props.accountId}`),
            },
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
              resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
          });
    }
}