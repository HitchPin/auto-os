import * as lambda from 'aws-lambda';
import { DomainController } from './r53';
import { RegisterDomainNameSchema, type RegisterDomainNameRequest } from '@auto-os/opensearch-schemas';

var _dc: DomainController | undefined = undefined;
const getDc = () => {
  if (_dc === undefined) {
    _dc = new DomainController();
  }
  return _dc;
}

const handleCreate = async (evt: lambda.CdkCustomResourceIsCompleteEvent): Promise<lambda.CdkCustomResourceResponse> => {
  const props = evt.ResourceProperties as unknown as { RegistrationJson: string };
  const m = RegisterDomainNameSchema.parse(props.RegistrationJson);
  const dc = getDc();
  const r = await dc.tryPurchaseDomain({
    adminContact: m.AdminContact!,
    billingContact: m.BillingContact!,
    registrantContact: m.RegistrantContact!,
    techContact: m.TechContact!,
    autoRenew: m.AutoRenew,
    purchaseYears: m.DurationInYears!,
    domainName: m.DomainName!,
    privacyProtectAdminContact: m.PrivacyProtectAdminContact!,
    privacyProtectBillingContact: m.PrivacyProtectBillingContact!,
    privacyProtectRegistrantContact: m.PrivacyProtectRegistrantContact!,
    privacyProtectTechContact: m.PrivacyProtectTechContact!,
  });
  console.log("Create snapshot response:");
  console.log(r);
  return {
    PhysicalResourceId: m.DomainName!,
    Data: {
      InFlightOperationId: r
    }
  };
}

const handleUpdate = async (e: lambda.CloudFormationCustomResourceUpdateEvent): Promise<lambda.CdkCustomResourceResponse> => {

  return {
    PhysicalResourceId: e.PhysicalResourceId,
    Data: {
    }
  };
};

const handleDelete = async (
  e: lambda.CloudFormationCustomResourceDeleteEvent
): Promise<lambda.CdkCustomResourceResponse> => {

  return {
    PhysicalResourceId: e.PhysicalResourceId
  };
};

export const handle: lambda.CdkCustomResourceHandler = async (
  req: lambda.CdkCustomResourceEvent, ctx: lambda.Context
): Promise<lambda.CdkCustomResourceResponse> => {

    if (req.RequestType === 'Create') {
      return await handleCreate(req);
    } else if (req.RequestType === 'Update') {
      return await handleUpdate(req);
    } else {
      return await handleDelete(req);
    } 
};


export const handleIsComplete: lambda.CdkCustomResourceIsCompleteHandler = async (
  r: lambda.CdkCustomResourceIsCompleteEvent, ctx: lambda.Context
): Promise<lambda.CdkCustomResourceIsCompleteResponse> => {
  
  const dc = getDc();
  const opId = r.Data!['InFlightOperationId']!;
  if (r.RequestType === 'Create') {
    const createStatus = await dc.checkRegistrationStatus(opId);
    if (createStatus instanceof Error) {
      throw createStatus;
    } else if (createStatus) {
      const data = await getCompleteInfo(r, ctx);
      return {
        IsComplete: true,
        Data: data
      }
    }
    return {
      IsComplete: false
    }
  }
  return {
    IsComplete: true
  }
}

const getCompleteInfo = async (r: lambda.CdkCustomResourceIsCompleteEvent, ctx: lambda.Context) => {
  const dc = getDc();
  const props = r.ResourceProperties as unknown as { RegistrationJson: string };
  const m = RegisterDomainNameSchema.parse(props.RegistrationJson);
  const i = await dc.getDomainInfo(m.DomainName!);

  const ns: string[] = i.Nameservers!.map(n => {
    const gips = (n!.GlueIps ?? []);
    return [n!.Name, ...gips].join('@');
  });
  return {
    RegistryDomainId: i.RegistryDomainId!,
    RegistrarName: i.RegistrarName!,
    WhoIsServer: i.WhoIsServer!,
    RegistrarUrl: i.RegistrarUrl!,
    AbuseContactEmail: i.AbuseContactEmail!,
    AbuseContactPhone: i.AbuseContactPhone!,
    Nameservers: ns
  }
}