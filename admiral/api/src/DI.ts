import { container, instanceCachingFactory, DependencyContainer } from 'tsyringe';
import { Organizations } from '@aws-sdk/client-organizations';
import { SFN } from '@aws-sdk/client-sfn';
import { SSM } from '@aws-sdk/client-ssm';
import * as managers from './data';
import * as apis from './apis';
import { Handler } from './Handler';
import * as helpers from './helper';
import * as machine from './machine';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers'

const accountRoleArn = process.env['ORG_ACCOUNT_CREATION_ROLE_ARN']!;
const orgRootId = process.env['ORG_ROOT_ID']!;
const destOuId = process.env['DEST_OU_ID']!;
const emailDomain = process.env['EMAIL_DOMAIN']!;
const adminAccountId = process.env['ADMIN_ACCOUNT_ID']!;
const machineArn = process.env['ACCOUNT_MACHINE_ARN']!;

// AWS Service Clients
container.register<SFN>(SFN.name, {
    useFactory: instanceCachingFactory<SFN>(c => new SFN())
});
container.register<SSM>(SSM.name, {
    useFactory: instanceCachingFactory<SSM>(c => new SSM())
});
container.register<Organizations>(Organizations.name, {
    useFactory: instanceCachingFactory<Organizations>(c => new Organizations({
        credentials: fromTemporaryCredentials({
            params: {
                RoleArn: accountRoleArn,
                DurationSeconds: 60 * 15,
                RoleSessionName: 'org-account-creator',
            }
        })
    }))
});

// Mid-level Helpers
container.register<helpers.OrgAccountHelper>(helpers.OrgAccountHelper.name, {
    useFactory: instanceCachingFactory<helpers.OrgAccountHelper>(c => new helpers.OrgAccountHelper({
        orgClient: c.resolve(Organizations.name),
        initialRootId: orgRootId,
        accountEmailDomainName: emailDomain,
        accountOu: destOuId,
        accountRoleArn: accountRoleArn,
        adminAccountId: adminAccountId
    }))
});
container.register<helpers.MachineStarter>(helpers.MachineStarter.name, {
    useFactory: instanceCachingFactory<helpers.MachineStarter>(c => new helpers.MachineStarter(
        c.resolve<SFN>(SFN.name),
        machineArn
    ))
});
container.register<helpers.PortfolioHelper>(helpers.PortfolioHelper.name, {
    useFactory: instanceCachingFactory<helpers.PortfolioHelper>(c => new helpers.PortfolioHelper(
        accountRoleArn
    ))
});

// High-level managers
container.register<managers.ITenantManager>(managers.SSMTenantManager.name, {
    useFactory: (c: DependencyContainer) => new managers.SSMTenantManager(
        c.resolve(SSM.name)!)
});
container.register<managers.IProjectManager>(managers.SSMOrganizationsProjectManager.name, {
    useFactory: (c: DependencyContainer) => new managers.SSMOrganizationsProjectManager(
        c.resolve<SSM>(SSM.name)!,
        c.resolve<helpers.OrgAccountHelper>(helpers.OrgAccountHelper.name)!,
        c.resolve<helpers.MachineStarter>(helpers.MachineStarter.name))
});

// API Handlers
container.register<apis.CreateTenantHandler>(apis.CreateTenantHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.CreateTenantHandler(
        c.resolve(managers.SSMTenantManager.name)!)
});
container.register<apis.ListTenantsHandler>(apis.ListTenantsHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.ListTenantsHandler(
        c.resolve(managers.SSMTenantManager.name)!)
});
container.register<apis.GetTenantHandler>(apis.GetTenantHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.GetTenantHandler(
        c.resolve(managers.SSMTenantManager.name)!)
});
container.register<apis.DeleteTenantHandler>(apis.DeleteTenantHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.DeleteTenantHandler(
        c.resolve(managers.SSMTenantManager.name)!)
});

container.register<apis.CreateProjectHandler>(apis.CreateProjectHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.CreateProjectHandler(
        c.resolve(managers.SSMOrganizationsProjectManager.name)!)
});

container.register<apis.GetProjectHandler>(apis.GetProjectHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.GetProjectHandler(
        c.resolve(managers.SSMOrganizationsProjectManager.name)!)
});

container.register<apis.ListProjectsHandler>(apis.ListProjectsHandler.name, {
    useFactory: (c: DependencyContainer) => new apis.ListProjectsHandler(
        c.resolve(managers.SSMOrganizationsProjectManager.name)!)
});

// Top level request router
container.register<Handler>(Handler.name, {
    useFactory: (c: DependencyContainer) => new Handler({
        CreateTenant: c.resolve<apis.CreateTenantHandler>(apis.CreateTenantHandler.name)!,
        GetTenant: c.resolve<apis.GetTenantHandler>(apis.GetTenantHandler.name)!,
        DeleteTenant: c.resolve<apis.DeleteTenantHandler>(apis.DeleteTenantHandler.name)!,
        ListTenants: c.resolve<apis.ListTenantsHandler>(apis.ListTenantsHandler.name)!,

        CreateProject: c.resolve<apis.CreateProjectHandler>(apis.CreateProjectHandler.name)!,
        GetProject: c.resolve<apis.GetProjectHandler>(apis.GetProjectHandler.name)!,
        ListProjects: c.resolve<apis.ListProjectsHandler>(apis.ListProjectsHandler.name)!,
    })
});

container.register<machine.MachineOrchestrator>(machine.MachineOrchestrator.name, {
    useFactory: (c: DependencyContainer) => new machine.MachineOrchestrator(
        c.resolve<helpers.OrgAccountHelper>(helpers.OrgAccountHelper.name),
        c.resolve<helpers.PortfolioHelper>(helpers.PortfolioHelper.name),
    )
})