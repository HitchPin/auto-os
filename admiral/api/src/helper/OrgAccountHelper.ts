import { Organizations, CreateAccountRequest } from "@aws-sdk/client-organizations";
import { SSM } from "@aws-sdk/client-ssm";
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers'
import { Project } from "../schema";

interface OrgAccountHelperProps {
    accountEmailDomainName: string
    accountOu: string,
    initialRootId: string,
    accountRoleArn: string;
    orgClient: Organizations,
    adminAccountId: string
}
interface CreatedAccount {
    accountId: string,
    accountEmail: string
}
export class OrgAccountHelper {

    #emailDomain: string;
    #initialRootId: string;
    #destinationOu: string;
    #accountRoleArn: string;
    #adminAccountId: string;
    #org: Organizations;

    constructor(props: OrgAccountHelperProps) {
        this.#emailDomain = props.accountEmailDomainName;
        this.#destinationOu = props.accountOu;
        this.#initialRootId = props.initialRootId;
        this.#org = props.orgClient;
        this.#accountRoleArn = props.accountRoleArn;
        this.#adminAccountId = props.adminAccountId;
    }

    create = async (tenantName: string, proj: Project): Promise<CreatedAccount> => {
        const projectName = proj.name;
        const accountEmail = `tenant-${tenantName}-aws-${projectName}@${this.#emailDomain}`;
        const roleName = `AutoOsOrgAccessRole`;
        const accountName = `t_${tenantName}-p_${projectName}`;

        const createReq: CreateAccountRequest = {
            AccountName: accountName,
            Email: accountEmail,
            RoleName: roleName,
            IamUserAccessToBilling: 'ALLOW',
            Tags: [
                {
                    Key: 'TenantName',
                    Value: tenantName,
                },
                {
                    Key: 'ProjectName',
                    Value: projectName,
                },
            ]
        };
        console.log('Creating AWS account with request params:');
        console.log(createReq);
        const r = await this.#org.createAccount(createReq);
        let s = r.CreateAccountStatus!.State;
        if (s === 'FAILED') {
            throw new Error(r.CreateAccountStatus!.FailureReason!);
        }  else if (s === 'SUCCEEDED') {
            return await this.#finalizeAccount(tenantName, proj, {
                accountEmail: accountEmail,
                accountId: r.CreateAccountStatus!.AccountId!
            });
        }

        const getSec = () => new Date().getTime() / 1000.00;
        const startSec = getSec();
        while (getSec() - startSec < 180) {
            await new Promise<void>((resolve, reject) => setTimeout(() => resolve(), 5000));

            const stateRes = await this.#org.describeCreateAccountStatus({
                CreateAccountRequestId: r.CreateAccountStatus!.Id!
            });
            s = stateRes.CreateAccountStatus!.State;
            if (s === 'FAILED') {
                throw new Error(stateRes.CreateAccountStatus!.FailureReason!);
            }  else if (s === 'SUCCEEDED') {
                return await this.#finalizeAccount(tenantName, proj, {
                    accountEmail: accountEmail,
                    accountId: stateRes.CreateAccountStatus!.AccountId!
                });
            }
        }
        throw new Error('Create account timed out.');
    }

    registerBeacon = async (tenantName: string, proj: Project, ci: CreatedAccount): Promise<void> => {
        const ssm = await this.#ssmForAccount(proj.awsRegion, ci);
        await ssm.putParameter({
            Name: '/auto-os/beacon',
            Type: 'String',
            Value: JSON.stringify({
                pairedAccountId: proj.pairedAwsAccountId!,
                tenantName: tenantName,
                projectName: proj.name,
                accountEmail: ci.accountEmail,
                administratorAccount: this.#adminAccountId,
            }),
            Overwrite: true
        })
    }

    #finalizeAccount = async (tenantName: string, proj: Project, ci: CreatedAccount): Promise<CreatedAccount> => {
        await this.#org.moveAccount({
            SourceParentId: this.#initialRootId,
            AccountId: ci.accountId,
            DestinationParentId: this.#destinationOu
        });

        

        return ci;
    }

    #ssmForAccount = async (region: string, ci: CreatedAccount): Promise<SSM> => {
        const orgAdminCreds = fromTemporaryCredentials({
            params: {
                RoleArn: this.#accountRoleArn,
                DurationSeconds: 60 * 15,
                RoleSessionName: 'org-account-assumer',
            }
        });
        
        const ssm = new SSM({
            credentials: fromTemporaryCredentials({
                params: {
                    RoleArn: `arn:aws:iam::${ci.accountId}:role/AutoOsOrgAccessRole`,
                    DurationSeconds: 60 * 15,
                    RoleSessionName: 'org-account-creator',
                },
                masterCredentials: orgAdminCreds
            }),
            region: region
        });

        return ssm;
    }
}