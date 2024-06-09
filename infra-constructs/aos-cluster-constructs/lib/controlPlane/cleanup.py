import os
import boto3
from json import dumps
from dataclasses import dataclass

ec2 = boto3.client('ec2')
svc = boto3.client("servicediscovery")
eventbridge = boto3.client("servicediscovery")

SVC_ID = os.environ["DISCO_SVC_ID"]
EVENT_BUS_NAME = os.environ["EVENT_BUS_NAME"]

"""
		"node-name":                details.NodeName,
		"role":                     details.NodeClusterRole,
		"cluster-name":             details.ClusterName,
		"capacity-type":            details.CapacityType,
		"capacity-instance-id":     details.CapacityInstanceId,
		"registation-operation-id": details.RegistrationOperationId,
} """


def handle(event, context):

    if is_node_refresher_event(event):
        do_node_refresh()
    else:
        do_node_deregister(event)


def do_node_deregister(event):
    instance_id = event["detail"]["instance-id"]

    dres = svc.deregister_instance(ServiceId=SVC_ID, InstanceId=instance_id)
    op = dres['OperationId']
    print(f'Deregistered instance id {instance_id} from Discovery Service.')

    info = get_instance(instance_id)
    if info is None:
        print('No extra information found on instance.')
        return
    print('Obtained info about instance: f{info}')
    details = {
        "node-name": info.private_hostname,
        "role": info.role,
        "cluster-name": info.cluster_name,
        "capacity-type": "ec2",
        "capacity-instance-id": info.instance_id,
        "deregistration-operation-id": op,
    }
    r = eventbridge.put_events(
        Entries=[
            {
                "Source": "maestro",
                "DetailType": "Node terminated and unregistered",
                "Detail": dumps(details),
                "EventBusName": EVENT_BUS_NAME,
            },
        ],
    )
    er = r["Entries"]
    if 'EventId' in er and len(er['EventId']) > 0:
        print(f'Sent event with id {er['EventId']}')
    else:
        code = er['ErrorCode']
        msg = er['ErrorMessage']
        print(f'Event failed with code {code}: {msg}')


def do_node_refresh():
    print('Starting node refresh')
    discos = list_disco_instances()
    print('Found discos:')
    print(discos)


def is_node_refresher_event(event):
    if 'resources' not in event:
        return False

    rsrc = event['resources']
    if rsrc is None or len(rsrc) == 0 or len(rsrc) > 1:
        return False
    
    arn = rsrc[0]
    if 'arn:aws:events' in arn and ':rule/' in arn and 'node-refresher' in arn:
        return True
    return False

@dataclass
class InstanceInfo:
    cluster_name: str
    role: str
    instance_id: str
    private_hostname: str

def get_instance(instanceId: str):
    res = ec2.describe_instances(
        Filters=[
            {
                "Name": "instance-state-name",
                "Values": [
                    "terminated",
                ],
            },
        ],
        InstanceIds=[
            instanceId,
        ],
    )
    if "Reservations" not in res or len(res["Reservations"]) == 0:
        print("No reservation found in describe_instances response.")
        return None
    r = res['Reservations'][0]
    if 'Instances' not in r or len('Instances') == 0:
        print('No instance found in reservation.')
        return None
    i = r['Instances'][0]
    tags = i["Tags"]

    role = None
    cluster = None
    for t in tags:
        k = t['Key']
        v = t['Value']
        if k == 'Role':
            role = v
        elif k == 'Cluster':
            cluster = v

    pn = None
    ifaces = i["NetworkInterfaces"]
    if len(ifaces) >= 1:
        pn = ifaces[0]["PrivateDnsName"]
    return InstanceInfo(cluster, role, instanceId, pn)

def list_disco_instances():
    listRes = svc.list_instances(
        ServiceId=SVC_ID,
    )
    if 'Instances' not in listRes:
        return []
    ins = listRes['Instances']
    dis = []
    for i in ins:
        instanceId = i['Id']
        cluster = None
        role = None
        ip = None
        host = None
        for attK in i['Attributes']:
            attV = i['Attributes'][attK]
            if attK == 'Cluster':
                cluster = attV
            elif attK == 'Role':
                role = attV
            elif attK == 'Hostname':
                host = attV
            elif attK == 'AWS_INSTANCE_IPV4':
                ip = attV
        dis.append(DiscoInstance(instanceId, cluster, host, role, ip))
    return dis


@dataclass
class DiscoInstance:
    instanceId: str
    cluster: str
    hostname: str
    role: str
    ip: str