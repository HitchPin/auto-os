import { number, z } from 'zod';

const ExtraParamsNameSchema = z.enum([
    'DUNS_NUMBER','BRAND_NUMBER','BIRTH_DEPARTMENT',
    'BIRTH_DATE_IN_YYYY_MM_DD','BIRTH_COUNTRY',
    'BIRTH_CITY','DOCUMENT_NUMBER','AU_ID_NUMBER',
    'AU_ID_TYPE','CA_LEGAL_TYPE','CA_BUSINESS_ENTITY_TYPE',
    'CA_LEGAL_REPRESENTATIVE',
    'CA_LEGAL_REPRESENTATIVE_CAPACITY','ES_IDENTIFICATION',
    'ES_IDENTIFICATION_TYPE','ES_LEGAL_FORM',
    'FI_BUSINESS_NUMBER','FI_ID_NUMBER','FI_NATIONALITY',
    'FI_ORGANIZATION_TYPE','IT_NATIONALITY','IT_PIN',
    'IT_REGISTRANT_ENTITY_TYPE','RU_PASSPORT_DATA',
    'SE_ID_NUMBER','SG_ID_NUMBER','VAT_NUMBER',
    'UK_CONTACT_TYPE','UK_COMPANY_NUMBER',
    'EU_COUNTRY_OF_CITIZENSHIP','AU_PRIORITY_TOKEN']);

const CountryCodesSchema = z.enum([
    'AC','AD','AE','AF','AG','AI','AL',
    'AM','AN','AO','AQ','AR','AS','AT',
    'AU','AW','AX','AZ','BA','BB','BD',
    'BE','BF','BG','BH','BI','BJ','BL',
    'BM','BN','BO','BQ','BR','BS','BT',
    'BV','BW','BY','BZ','CA','CC','CD',
    'CF','CG','CH','CI','CK','CL','CM',
    'CN','CO','CR','CU','CV','CW','CX',
    'CY','CZ','DE','DJ','DK','DM','DO',
    'DZ','EC','EE','EG','EH','ER','ES',
    'ET','FI','FJ','FK','FM','FO','FR',
    'GA','GB','GD','GE','GF','GG','GH',
    'GI','GL','GM','GN','GP','GQ','GR',
    'GS','GT','GU','GW','GY','HK','HM',
    'HN','HR','HT','HU','ID','IE','IL',
    'IM','IN','IO','IQ','IR','IS','IT',
    'JE','JM','JO','JP','KE','KG','KH',
    'KI','KM','KN','KP','KR','KW','KY',
    'KZ','LA','LB','LC','LI','LK','LR',
    'LS','LT','LU','LV','LY','MA','MC',
    'MD','ME','MF','MG','MH','MK','ML',
    'MM','MN','MO','MP','MQ','MR','MS',
    'MT','MU','MV','MW','MX','MY','MZ',
    'NA','NC','NE','NF','NG','NI','NL',
    'NO','NP','NR','NU','NZ','OM','PA',
    'PE','PF','PG','PH','PK','PL','PM',
    'PN','PR','PS','PT','PW','PY','QA',
    'RE','RO','RS','RU','RW','SA','SB',
    'SC','SD','SE','SG','SH','SI','SJ',
    'SK','SL','SM','SN','SO','SR','SS',
    'ST','SV','SX','SY','SZ','TC','TD',
    'TF','TG','TH','TJ','TK','TL','TM',
    'TN','TO','TP','TR','TT','TV','TW',
    'TZ','UA','UG','US','UY','UZ','VA',
    'VC','VE','VG','VI','VN','VU','WF',
    'WS','YE','YT','ZA','ZM','ZW']);

const ContactTypeSchema = z.enum([
    'PERSON', 'COMPANY', 'ASSOCIATION',
    'PUBLIC_BODY', 'RESELLER'
]);

const ExtraParamSchema = z.object({
    Name: ExtraParamsNameSchema.optional(),
    Value: z.string().optional()
});

const PhoneNumberSchema = z.string().regex(new RegExp('\+[0-9]{1,3}\.[0-9]{6,24}'));
const String8 = z.string().max(255);

const ContactDetailSchema = z.object({
    AddressLine1: String8.optional(),
    AddressLine2: String8.optional(),
    City: String8.optional(),
    ContactType: ContactTypeSchema.optional(),
    Country: CountryCodesSchema.optional(),
    Email: z.string().max(254).optional(),
    ExtraParams: z.array(ExtraParamSchema).optional(),
    Fax: PhoneNumberSchema.optional(),
    FirstName: String8.optional(),
    LastName: String8.optional(),
    Organization: String8.optional(),
    PhoneNumber: PhoneNumberSchema.optional(),
    State: String8.optional(),
    ZipCode: String8.optional()
});

/*
    IdnLangCode='string',
    DurationInYears=123,
    AutoRenew=True|False,
*/

const RegisterDomainNameSchema = z.object({
    DomainName: String8,
    DurationInYears: z.number().int(),
    AutoRenew: z.boolean().optional().default(true),
    AdminContact: ContactDetailSchema,
    BillingContact: ContactDetailSchema,
    RegistrantContact: ContactDetailSchema,
    TechContact: ContactDetailSchema,
    PrivacyProtectAdminContact: z.boolean(),
    PrivacyProtectBillingContact: z.boolean(),
    PrivacyProtectRegistrantContact: z.boolean(),
    PrivacyProtectTechContact: z.boolean(),
})

type RegisterDomainNameRequest = z.infer<typeof RegisterDomainNameSchema>;

type ContactDetail = z.infer<typeof ContactDetailSchema>;



export type { ContactDetail, RegisterDomainNameRequest };
export { ContactTypeSchema, RegisterDomainNameSchema };