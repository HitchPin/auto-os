import boto3
import json

ssm = boto3.client('ssm')

def on_event(event, context):
    print(event)
    request_type = event["RequestType"]
    if request_type == "Create":
        return on_create(event)
    if request_type == "Update":
        return on_update(event)
    if request_type == "Delete":
        return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)


def on_create(event):
    props = event["ResourceProperties"]
    print("create new resource with props %s" % props)

    physical_id = props["DataPlaneHydrateParam"]
    cpParam = props["ControlPlaneHydrateParam"]

    dpRes = ssm.get_parameter(
        Name=physical_id,
    )
    cpRes = ssm.get_parameter(Name=cpParam)
    dataplane = json.loads(dpRes["Parameter"]["Value"])
    controlplane = json.loads(cpRes["Parameter"]["Value"])
    dns = dataplane["LoadBalancerDnsName"]
    adminSecretId = controlplane["ClusterAdminSecretId"]
    return {
        "PhysicalResourceId": physical_id,
        "Data": {"ClusterUrl": f"https://{dns}", "AdminCredsSecretId": adminSecretId},
    }


def on_update(event):
    props = event["ResourceProperties"]
    physical_id = event["PhysicalResourceId"]
    cpParam = props["ControlPlaneHydrateParam"]

    dpRes = ssm.get_parameter(
        Name=physical_id,
    )
    cpRes = ssm.get_parameter(Name=cpParam)
    dataplane = json.loads(dpRes["Parameter"]["Value"])
    controlplane = json.loads(cpRes["Parameter"]["Value"])
    dns = dataplane["LoadBalancerDnsName"]
    adminSecretId = controlplane["ClusterAdminSecretId"]
    return {
        "PhysicalResourceId": physical_id,
        "Data": {"ClusterUrl": f"https://{dns}", "AdminCredsSecretId": adminSecretId},
    }


def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    print("delete resource %s" % physical_id)
