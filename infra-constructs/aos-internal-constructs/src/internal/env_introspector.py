import boto3
import botocore.exceptions
from dataclasses import dataclass
from typing import Optional

sts = boto3.client('sts')
org = boto3.client('organizations', region_name='us-east-1')

@dataclass
class OrgMembershipInfo:
    org_id: str
    org_arn: str
    master_account_id: str
    admin_svcs: list[str]


def get_my_org_membership(throw_without_org: bool) -> Optional[OrgMembershipInfo]:
    org_id: Optional[str] = None
    org_arn: Optional[str] = None
    master_account_id: Optional[str] = None
    try:
        org_info = org.describe_organization()
        oo = org_info['Organization']
        org_id = oo["Id"]
        org_arn = oo["Arn"]
        master_account_id = oo["MasterAccountId"]
    except botocore.exceptions.ClientError as err:
        if (
            err.response["Error"]["Code"] == "AWSOrganizationsNotInUseException"
        ):
            if throw_without_org:
                raise err
            return None
        else:
            raise err
    svc_principals: list[str] = []
    try:
        svc_principals = list_my_delegated_admin_services()
    except botocore.exceptions.ClientError as err:
        code = err.response["Error"]["Code"]
        print(f'Swallowing organizations exception with code {code}')
    return OrgMembershipInfo(org_id, org_arn, master_account_id, svc_principals)


def list_my_delegated_admin_services() -> list[str]:

    stsRes = sts.get_caller_identity()
    my_account_id = stsRes["Account"]
    next = None
    svc_principals = []
    while True:
        req = {
            'MaxResults': 25
        }
        if next is not None:
            req['NextToken'] = next
        res = org.list_delegated_services_for_account(AccountId=my_account_id)
        if 'DelegatedServices' in res:
            for da in res['DelegatedServices']:
                svc_principals.append(da['ServicePrincipal'])
        if 'NextToken' in res and res['NextToken'] is not None:
            next = res["NextToken"]
        else:
            return list(set(svc_principals))


def on_event(event, context):
    print(event)
    request_type = event["RequestType"]
    if request_type == "Create":
        props = event["ResourceProperties"]
        throw_without_org = props["ThrowIfNotInOrg"]
        return on_create_or_update(throw_without_org)
    if request_type == "Update":
        return on_create_or_update(event)
    if request_type == "Delete":
        return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)


def on_create_or_update(throw_without_org):

    org_info = get_my_org_membership(throw_without_org)
    data = {
        "InOrganization": org_info is not None,
    }
    if org_info is not None:
        data["OrgId"] = org_info.org_id
        data["OrgArn"] = org_info.org_arn
        data["MasterAccountId"] = org_info.master_account_id
        data["MyDelegatedAdminServices"] = org_info.admin_svcs
    else:
        data["OrgId"] = ''
        data["OrgArn"] = ''
        data["MasterAccountId"] = ''
        data["MyDelegatedAdminServices"] = []
    return {
        "PhysicalResourceId": "env_introspector",
        "Data": data
    }


def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    print("delete resource %s" % physical_id)
    return {"PhysicalResourceId": "env_introspector"}
