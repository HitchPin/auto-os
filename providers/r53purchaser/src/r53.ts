import { Route53Domains, ContactDetail as R53Contact, GetDomainDetailResponse } from '@aws-sdk/client-route-53-domains';
import { type ContactDetail } from '@auto-os/opensearch-schemas';

interface TryPurchaseDomainArgs {
    domainName: string,
    purchaseYears: number,
    autoRenew?: boolean,
    adminContact: ContactDetail,
    registrantContact: ContactDetail,
    techContact: ContactDetail,
    billingContact: ContactDetail,
    privacyProtectAdminContact: boolean;
    privacyProtectRegistrantContact: boolean;
    privacyProtectTechContact: boolean;
    privacyProtectBillingContact: boolean;
}

class DomainController {

    #client: Route53Domains;

    constructor(ct?: Route53Domains) {
        this.#client = ct ?? new Route53Domains();
    }

    tryPurchaseDomain = async (args: TryPurchaseDomainArgs): Promise<string> => {
        const r = await this.#client.registerDomain({
            DomainName: args.domainName,
            DurationInYears: args.purchaseYears,
            AutoRenew: args.autoRenew ?? true,
            AdminContact: args.adminContact as any as R53Contact,
            BillingContact: args.billingContact as any as R53Contact,
            RegistrantContact: args.registrantContact as any as R53Contact,
            TechContact: args.techContact as any as R53Contact,
            PrivacyProtectAdminContact: args.privacyProtectAdminContact,
            PrivacyProtectBillingContact: args.privacyProtectBillingContact,
            PrivacyProtectRegistrantContact: args.privacyProtectRegistrantContact,
            PrivacyProtectTechContact: args.privacyProtectTechContact,
        });
        return r.OperationId!;
    }

    getDomainInfo = async (domainName: string): Promise<GetDomainDetailResponse> => {
        return await this.#client.getDomainDetail({
            DomainName: domainName
        });
    }

    /*
    readonly ERROR: "ERROR";
    readonly FAILED: "FAILED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly SUBMITTED: "SUBMITTED";
    readonly SUCCESSFUL: "SUCCESSFUL";
    */

    checkRegistrationStatus = async (id: string): Promise<boolean | Error> => {
        const detail = await this.#client.getOperationDetail({
            OperationId: id
        });
        const s = detail.Status;
        if (s === 'ERROR' || s === 'FAILED') {
            throw new Error(detail.Message!);
        } else if (s === 'SUBMITTED' || s === 'IN_PROGRESS') {
            return false;
        }
        return true;
    }

}

export { DomainController }