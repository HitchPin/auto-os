import boto3
import time

org = boto3.client("organizations", region_name='us-east-1')

CFN_PRINCIPAL_NAME = "stacksets.cloudformation.amazonaws.com"
SVC_CAT_PRINCIPAL_NAME = "servicecatalog.amazonaws.com"
QUOTAS_PRINCIPAL_NAME = "servicequotas.amazonaws.com"
NETMAN_PRINCIPAL_NAME = "networkmanager.amazonaws.com"


def enable_svccatalog():
    svc_cat = boto3.client("servicecatalog", region_name="us-east-1")
    svc_cat.enable_aws_organizations_access()

def enable_cfn():
    cfn = boto3.client("cloudformation", region_name='us-east-1')
    cfn.activate_organizations_access()


def enable_svc_quotas():
    sq = boto3.client("service-quotas", region_name="us-east-1")
    sq.associate_service_quota_template()

def enable_netman():
    nm = boto3.client('networkmanager', region_name='us-east-1')
    nm.start_organization_service_access_update(
        Action='ENABLE'
    )

OVERRIDES = {}
OVERRIDES[CFN_PRINCIPAL_NAME] = enable_cfn
OVERRIDES[SVC_CAT_PRINCIPAL_NAME] = enable_svccatalog
OVERRIDES[QUOTAS_PRINCIPAL_NAME] = enable_svc_quotas
OVERRIDES[NETMAN_PRINCIPAL_NAME] = enable_netman

def enable_services(services: list[str]):
    for svc in services:
        if svc in OVERRIDES:
            OVERRIDES[svc]()
        else:
            org.enable_aws_service_access(ServicePrincipal=svc)
        time.sleep(1)
        print(f'Enabled {svc}.')

def on_event(event, context):
    print(event)
    request_type = event["RequestType"]
    if request_type == "Create":
        services = event["ResourceProperties"]['ServicePrincipals']
        print(f'Found these services to enable:\n{services}')
        enable_services(services)
        return {"PhysicalResourceId": 'org_service_enabler'}
    if request_type == "Update":
        return {"PhysicalResourceId": "org_service_enabler"}
    if request_type == "Delete":
        return {"PhysicalResourceId": "org_service_enabler"}
    raise Exception("Invalid request type: %s" % request_type)
