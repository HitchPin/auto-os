import { Construct } from "constructs";
import {
    Fn,
  Stack,
  aws_iam as iam
} from "aws-cdk-lib";

export class RegisteredTenant {

    private constructor(private readonly accountId: string, private readonly registeredName: string) {

    }

    get tenantName(): string {
        return this.registeredName
    }
    get accountPrincipal(): iam.AccountPrincipal {
        return new iam.AccountPrincipal(this.accountId);
    }

    static of(c: Construct) {
        const name = Fn.importValue('TenantRegistration_RegisteredName');
        const accountId = Fn.importValue('TenantRegistration_AccountId');
        return new RegisteredTenant(accountId, name);
    }
}