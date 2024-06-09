import boto3
import time

CFN_PRINCIPAL_NAME = "stacksets.cloudformation.amazonaws.com"
SVC_CAT_PRINCIPAL_NAME = "servicecatalog.amazonaws.com"
QUOTAS_PRINCIPAL_NAME = "servicequotas.amazonaws.com"
NETMAN_PRINCIPAL_NAME = "networkmanager.amazonaws.com"


def register_cloudtrail_admin(admin_id: str):
    ct = boto3.client("cloudtrail")
    ct.register_organization_delegated_admin(MemberAccountId=admin_id)


def register_org_admin(admin_id: str, svc_principal: str):
    ct = boto3.client("organizations")
    ct.register_delegated_administrator(
        AccountId=admin_id, ServicePrincipal=svc_principal
    )

def register_stacksets_admin(admin_id: str):
    register_org_admin(admin_id, "member.org.stacksets.cloudformation.amazonaws.com")


def register_config_admin(admin_id: str):
    register_org_admin(admin_id, "config-multiaccountsetup.amazonaws.com")


def register_inspector_admin(admin_id: str):
    register_org_admin(admin_id, "inspector2.amazonaws.com")


def register_health_admin(admin_id: str):
    register_org_admin(admin_id, "health.amazonaws.com")

def register_resource_explorer(admin_id: str):
    register_org_admin(admin_id, "resource-explorer-2.amazonaws.com")


def register_sso_admin(admin_id: str):
    register_org_admin(admin_id, "sso.amazonaws.com")


def register_accountmanager_admin(admin_id: str):
    register_org_admin(admin_id, "account.amazonaws.com")


def register_fms_admin(admin_id: str):
    register_org_admin(admin_id, "fms.amazonaws.com")


OVERRIDES = {}
OVERRIDES["fms.amazonaws.com"] = register_fms_admin
OVERRIDES["account.amazonaws.com"] = register_accountmanager_admin
OVERRIDES["sso.amazonaws.com"] = register_sso_admin
OVERRIDES["resource-explorer-2.amazonaws.com"] = register_resource_explorer
OVERRIDES["health.amazonaws.com"] = register_health_admin
OVERRIDES["inspector2.amazonaws.com"] = register_inspector_admin
OVERRIDES["config.amazonaws.com"] = register_config_admin
OVERRIDES["stacksets.cloudformation.amazonaws.com"] = register_stacksets_admin
OVERRIDES["cloudtrail.amazonaws.com"] = register_org_admin

def register_delegated_admin(services: list[str]):
    for svc in services:
        if svc in OVERRIDES:
            OVERRIDES[svc]()
            time.sleep(1)
            print(f"Enabled {svc}.")
        else:
            print(f"No handler found for service: {svc}.")


def on_event(event, context):
    print(event)
    request_type = event["RequestType"]
    if request_type == "Create":
        services = event["ResourceProperties"]["ServicePrincipals"]
        print(f"Found these services to enable:\n{services}")
        register_delegated_admin(services)
        return {"PhysicalResourceId": "org_service_enabler"}
    if request_type == "Update":
        return {"PhysicalResourceId": "org_service_enabler"}
    if request_type == "Delete":
        return {"PhysicalResourceId": "org_service_enabler"}
    raise Exception("Invalid request type: %s" % request_type)
