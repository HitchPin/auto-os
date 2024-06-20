import boto3
import botocore.exceptions
from dataclasses import dataclass
from typing import Optional

svcat = boto3.client('servicecatalog')

def list_in_progress_products():
    products = svcat.search_provisioned_products(
        AccessLevelFilter={
            'Key': 'Account',
            'Value': 'self'
        },
        Filters={
            'SearchQuery': [
                'status:UNDER_CHANGE',
            ]
        },
    )
    return products['ProvisionedProducts']

@dataclass
class Product:
    id: str
    pp_id: str
    name: str

def find_product() -> Optional[Product]:
    products = list_in_progress_products()
    for p in products:
        if p['Type'] not in ['CFN_STACK','CFN_STACKSET']:
            continue
        if p['ProductName'] != 'OpenSearch Cluster':
            continue
        return Product(
            p['ProductId'],
            p['Id'],
            p['Name']
        )
    return None

def on_create_or_update():
    p = find_product()
    if p is None:
        raise Exception("Could not find product.")

    return {
        "PhysicalResourceId": p.pp_id,
        "Data": {
            'ProvisionedProductId': p.pp_id,
            'ProductId': p.id,
            'Name': p.name
        }
    }

def on_event(event, context):
    print(event)
    request_type = event["RequestType"]
    if request_type == "Create":
        return on_create_or_update()
    if request_type == "Update":
        return on_create_or_update()
    if request_type == "Delete":
        return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)

def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    print("delete resource %s" % physical_id)
    return {"PhysicalResourceId": physical_id}
