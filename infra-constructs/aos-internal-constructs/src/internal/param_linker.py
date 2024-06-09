import boto3

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

    physical_id = props["ParameterName"]
    amiId = props["AmiId"]

    ssm.put_parameter(
        Name=props["ParameterName"],
        Value=amiId,
        Type="String",
        Overwrite=True,
        Tier="Intelligent-Tiering",
        DataType="aws:ec2:image",
    )

    return {"PhysicalResourceId": physical_id}


def on_update(event):
    physical_id = event["PhysicalResourceId"]
    props = event["ResourceProperties"]

    amiId = props['AmiId']

    ssm.put_parameter(
        Name=props["ParameterName"],
        Value=amiId,
        Type="String",
        Overwrite=True,
        Tier="Intelligent-Tiering",
        DataType="aws:ec2:image",
    )

    print("update resource %s with props %s" % (physical_id, props))


def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    print("delete resource %s" % physical_id)
