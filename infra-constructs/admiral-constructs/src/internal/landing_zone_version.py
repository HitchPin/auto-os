import boto3
import botocore.exceptions
from dataclasses import dataclass
from typing import Optional

controltower = boto3.client('controltower')

@dataclass
class SecurityConfig:
    auditAccountId: str
    accessManagement: str

@dataclass
class LoggingConfig:
    accountId: str
    logRetentionDays: str
    accessLogRetention: str
    encryptionKeyArn: str

@dataclass
class Manifest:
    security: SecurityConfig
    logging: SecurityConfig
    managementAccountId: str

@dataclass
class ControlTowerProps:
    manifest: str

def get_props(event):
    p = event["ResourceProperties"]
    manifest_json = p['ManifestJson']


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
