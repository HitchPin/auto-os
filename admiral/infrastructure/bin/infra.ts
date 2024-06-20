#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as stacks from '../lib';
import * as dns from '../lib/serviceadmin/dns'

const app = new cdk.App();
const orgAdminEnv: cdk.Environment = {
  account: "533267097423",
  region: 'us-east-2'
};
const serviceAdminEnv: cdk.Environment =  {
  account: "905418336225",
  region: orgAdminEnv.region
}

const provisionerStack = new stacks.ProvisionerStack(app, "Provisioner", {
  env: orgAdminEnv
});
const bs = new stacks.BaseInfrastructureStack(app, 'BaseInfrastructure', {
  domainName: 'auto-os.dev',
  env: serviceAdminEnv
});

const accountFactoryStack = new stacks.AccountFactoryStack(app, 'AccountFactory', {
  dnsZone: dns.DnsZone.fromZone(bs.hostedZone),
  tenantMailDomain: 'tenants.auto-os.dev',
  env: serviceAdminEnv,
  tenantEventBus: bs.tenantInbox
});
const registrarStack = new stacks.RegistrarStack(app, "Registrar", {
  managedAccountsOuId: 'ou-mx2e-7po8x0v1',
  env: serviceAdminEnv,
  tenantEventBus: bs.tenantInbox
});
const forgeStack = new stacks.ForgeStack(app, 'Forge', {
  env: serviceAdminEnv
});
new stacks.ClusterOfferingStack(app, 'Offering', {
  clusterAccountsOuId: 'ou-mx2e-7po8x0v1',
  tenantEventBus: bs.tenantInbox,
  env: serviceAdminEnv,
  versionId: 'v10',
  encryptionKeyId: '2afbb266-1824-4bf7-990f-334a5b55f0a6',
  bucketName: bs.assetsBucketName
});
new stacks.ApiStack(app, 'Api', {
  dnsZone: dns.DnsZone.fromZone(bs.hostedZone),
  env: serviceAdminEnv,
  accountEmailDomainName: 'tenants.auto-os.dev',
  orgRootId: 'r-mx2e',
  destinationOuId: 'ou-mx2e-7po8x0v1',
  orgRoleArn: `arn:aws:iam::${orgAdminEnv.account!}:role/AccountCreationRole`
});

new stacks.CicdStack(app, 'Cicd', {
  
});