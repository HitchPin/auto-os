import os
import boto3
import json
import datetime
from datetime import timezone
from dataclasses import dataclass

asg = boto3.client("autoscaling")
eventbridge = boto3.client('events')
imgb = boto3.client('imagebuilder')
EVENT_BUS_NAME = os.environ["EVENT_BUS_NAME"]

def handle(event, context):
    if 'Records' in event:
        handle_sqs(event)
    elif 'source' in event:
        source = event['source']
        if source == 'aws.autoscaling':
            handle_asg(event)
        elif source == "aws.imagebuilder":
            handle_ami(event)


def handle_sqs(event):

    envs: list[DedupeEnv] = []
    for record in event['Records']:
        env = get_envelope(record)
        envs.append(env)

    if len(envs) == 0:
        return

    entries = []
    for env in envs:
        entries.append(
            {
                "Time": env.send_ts,
                "Source": env.source,
                "Resources": env.resources,
                "DetailType": env.detailType,
                "Detail": env.detail,
                "EventBusName": EVENT_BUS_NAME,
            }
        )
    eventbridge.put_events(Entries=entries)
    print(f'Send {len(entries)} events.')

""" {
  "version": "0",
  "id": "12345678-1234-1234-1234-123456789012",
  "detail-type": "EC2 Instance Launch Successful",
  "source": "aws.autoscaling",
  "account": "123456789012",
  "time": "yyyy-mm-ddThh:mm:ssZ",
  "region": "us-west-2",
  "resources": [
    "auto-scaling-group-arn",
    "instance-arn"
  ],
  "detail": {
    "StatusCode": "InProgress",
    "Description": "Launching a new EC2 instance: i-12345678",
    "AutoScalingGroupName": "my-asg",
    "ActivityId": "87654321-4321-4321-4321-210987654321",
    "Details": {
      "Availability Zone": "us-west-2b",
      "Subnet ID": "subnet-12345678"
    },
    "RequestId": "12345678-1234-1234-1234-123456789012",
    "StatusMessage": "",
    "EndTime": "yyyy-mm-ddThh:mm:ssZ",
    "EC2InstanceId": "i-1234567890abcdef0",
    "StartTime": "yyyy-mm-ddThh:mm:ssZ",
    "Cause": "description-text",
    "Origin": "EC2",
    "Destination": "AutoScalingGroup"
  }
} """

""" {
    "version": "0",
    "id": "f2ae6e60-ae3e-5618-7764-db55672feabd",
    "detail-type": "Node added to Search Cluster",
    "source": "maestro",
    "account": "609912790087",
    "time": "2024-05-13T08:16:12Z",
    "region": "us-west-2",
    "resources": [],
    "detail": {
        "capacity-instance-id": "i-097ea50612238e97b",
        "capacity-type": "ec2",
        "cluster-name": "search",
        "node-name": "i-097ea50612238e97b",
        "role": "bootstrapper",
    },
} """

INSTANCE_LAUNCHED='EC2 Instance Launch Successful'
INSTANCE_TERMINATED = "EC2 Instance Terminate Successful"
REFRESH_COMPLETED = "EC2 Auto Scaling Instance Refresh Succeeded"

def handle_asg(event):
    print('ASG notification!')
    print(event)

    asg_name = event["detail"]["AutoScalingGroupName"]
    asg_info = get_asg_info(asg_name)

    entry = {
        "Source": 'maestro',
        "Resources": event['resources'],
        "EventBusName": EVENT_BUS_NAME,
    }
    if event['detail-type'] == INSTANCE_LAUNCHED:
        instanceId = event["detail"]["EC2InstanceId"]
        entry["DetailType"] = 'Node Capacity Launched'
        detail = {
            "capacity-instance-id": instanceId,
            "capacity-type": "ec2",
            "cluster-name": asg_info.cluster,
            "zone": event['detail']['Details']['Availability Zone'],
            "role": asg_info.role,
        }
        entry['Detail'] = json.dumps(detail)
    elif event["detail-type"] == INSTANCE_TERMINATED:
        instanceId = event["detail"]["EC2InstanceId"]
        entry["DetailType"] = "Node Capacity Terminated"
        detail = {
            "capacity-instance-id": instanceId,
            "capacity-type": "ec2",
            "cluster-name": asg_info.cluster,
            "role": asg_info.role,
        }
        entry["Detail"] = json.dumps(detail)

    else:
        return

    eventbridge.put_events(Entries=[entry])
    print(f"Forwarded 1 ASG events.")


@dataclass
class AsgInfo:
    cluster: str
    role: str
    stage: str


""" {
    "version": "0",
    "id": "a1b2c3d4-5678-90ab-cdef-EXAMPLE11111",
    "detail-type": "EC2 Image Builder Image State Change",
    "source": "aws.imagebuilder",
    "account": "111122223333",
    "time": "2024-01-18T17:50:56Z",
    "region": "us-west-2",
    "resources": [
        "arn:aws:imagebuilder:us-west-2:111122223333:image/cmkencryptedworkflowtest-a1b2c3d4-5678-90ab-cdef-EXAMPLE22222/1.0.0/1"
    ],
    "detail": {
        "previous-state": {"status": "TESTING"},
        "state": {"status": "AVAILABLE"},
    },
} """


def handle_ami(event):

    detail = event['detail']
    prevState = str.upper(detail["previous-state"]["status"])
    curState = str.upper(detail["state"]["status"])

    entry = {
        "Source": "maestro",
        "Resources": event["resources"],
        "EventBusName": EVENT_BUS_NAME,
    }
    imageVersionArn = event['resources'][0]
    imgRes = imgb.get_image(imageBuildVersionArn=imageVersionArn)
    image = imgRes["image"]
    amisRsrcs = image["outputResources"]["amis"]
    amis = {}
    for amiRsrc in amisRsrcs:
        region = amiRsrc['region']
        ami = amiRsrc['image']
        amis[region] = ami

    if str.lowercurState == "AVAILABLE":
        entry["DetailType"] = "Fresh Baked AMI"
        detail = {
            "image-ids": amis,
            "architecture": ""
        }
        entry["Detail"] = json.dumps(detail)
    elif curState == 'FAILED':
        pass
    pass


def get_asg_info(asg_name) -> AsgInfo:
    response = asg.describe_auto_scaling_groups(
        AutoScalingGroupNames=[asg_name],
    )
    asgi = response["AutoScalingGroups"][0]
    tags = asgi["Tags"]
    cluster = None
    role = None
    stage = None
    for t in tags:
        k = t['Key']
        v = t["Value"]
        if str.lower(k) == 'cluster':
            cluster = v
        elif str.lower(k) == 'role':
            role = v
        elif str.lower(k) == "stage":
            stage = v
    return AsgInfo(cluster, role, stage)


@dataclass
class DedupeEnv:
    send_ts: datetime.datetime
    source: str
    resources: list[str]
    detailType: list[str]
    detail: str

def get_envelope(record) -> DedupeEnv:
    print('Record:')
    print(record)
    payload = record["body"]
    jobj = json.loads(payload)
    epoch_sec = record["attributes"]["SentTimestamp"]
    ts = datetime.datetime.fromtimestamp(int(epoch_sec) / 1000, tz=timezone.utc)
    return DedupeEnv(
        send_ts=ts,
        source=jobj["source"],
        resources=jobj["resources"],
        detailType=jobj["detailType"],
        detail=jobj["detail"],
    )
