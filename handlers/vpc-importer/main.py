import boto3
import json
from dataclasses import dataclass

ec2 = boto3.client("ec2")


@dataclass
class SubnetInfo:
    CidrBlock: str
    SubnetId: str
    AvailabilityZone: str
    SubnetType: str


def get_si(subnet) -> SubnetInfo:
    st = None
    for tag in subnet["Tags"]:
        if tag["Key"] == "aws-cdk:subnet-type":
            st = tag["Value"]

    return SubnetInfo(
        CidrBlock=subnet["CidrBlock"],
        SubnetId=subnet["SubnetId"],
        AvailabilityZone=subnet["AvailabilityZone"],
        SubnetType=st,
    )


def get_subnets(vpcid) -> list[SubnetInfo]:
    response = ec2.describe_subnets(Filters=[{"Name": "vpc-id", "Values": [vpcid]}])
    sn = []
    for s in response["Subnets"]:
        sn.append(get_si(s))
    return sn


@dataclass
class VpcInfo:
    Id: str
    CidrBlock: str
    PrivateSubnets: list[str]
    IsolatedSubnets: list[str]
    PublicSubnets: list[str]


def describe(vpcid) -> VpcInfo:
    response = ec2.describe_vpcs(VpcIds=[vpcid])
    vpc = response["Vpcs"][0]
    pubsubs = []
    privsubs = []
    isosubs = []
    azs = []
    subs = get_subnets(vpcid)
    for s in subs:
        azs.append(s.AvailabilityZone)
        if str.lower(s.SubnetType) == "public":
            pubsubs.append(s.SubnetId)
        elif str.lower(s.SubnetType) == "private":
            privsubs.append(s.SubnetId)
        elif str.lower(s.SubnetType) == "isolated":
            isosubs.append(s.SubnetId)
    azs = list(set(azs))
    return VpcInfo(
        Id=vpcid,
        CidrBlock=vpc["CidrBlock"],
        PrivateSubnets=privsubs,
        PublicSubnets=pubsubs,
        IsolatedSubnets=isosubs,
    )


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
    vpcid = props["VpcId"]
    described = describe(vpcid)
    return {"PhysicalResourceId": vpcid, "ResourceProperties": json.dumps(described)}


def on_update(event):
    pass


def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    print("delete resource %s" % physical_id)
