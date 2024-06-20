import * as lambda from 'aws-lambda';
import { TowerManager } from './ct';
import { FiefdomManifestSchema, type FiefdomProps } from '@auto-os/opensearch-schemas';

var _towerManager: TowerManager | undefined = undefined;
const getTm = () => {
  if (_towerManager === undefined) {
    _towerManager = new TowerManager();
  }
  return _towerManager;
}

const handleCreate = async (evt: lambda.CdkCustomResourceIsCompleteEvent): Promise<lambda.CdkCustomResourceResponse> => {
  const props = evt.ResourceProperties as unknown as FiefdomProps;
  const m = FiefdomManifestSchema.parse(props.ManifestJsonString);
  const tm = getTm();
  const r = await tm.create(m);
  console.log("Create snapshot response:");
  console.log(r);
  return {
    PhysicalResourceId: r.arn,
    Data: {
      InFlightOperationId: r.opId
    }
  };
}

const handleUpdate = async (e: lambda.CloudFormationCustomResourceUpdateEvent): Promise<lambda.CdkCustomResourceResponse> => {
  const lzId = e.PhysicalResourceId;
  const props = e.ResourceProperties as unknown as FiefdomProps;
  const tm = getTm();

  const m = FiefdomManifestSchema.parse(props.ManifestJsonString);
  const r = await tm.create(m);
  const p = await tm.updateManifest(lzId, m);
  console.log("Update lz operation id:");
  console.log(r);
  return {
    PhysicalResourceId: lzId,
    Data: {
      InFlightOperationId: p
    }
  };
};

const handleDelete = async (
  e: lambda.CloudFormationCustomResourceDeleteEvent
): Promise<lambda.CdkCustomResourceResponse> => {

  return {
    PhysicalResourceId: e.PhysicalResourceId
  };
};

export const handle: lambda.CdkCustomResourceHandler = async (
  req: lambda.CdkCustomResourceEvent, ctx: lambda.Context
): Promise<lambda.CdkCustomResourceResponse> => {

    if (req.RequestType === 'Create') {
      return await handleCreate(req);
    } else if (req.RequestType === 'Update') {
      return await handleUpdate(req);
    } else {
      return await handleDelete(req);
    } 
};


export const handleIsComplete: lambda.CdkCustomResourceIsCompleteHandler = async (
  r: lambda.CdkCustomResourceIsCompleteEvent, ctx: lambda.Context
): Promise<lambda.CdkCustomResourceIsCompleteResponse> => {
  
  const tm = getTm();
  const lzId = r.PhysicalResourceId;
  const opId = r.Data!['InFlightOperationId']!;
  if (r.RequestType === 'Create') {
    const createStatus = await tm.checkCreateStatus(opId);
    if (createStatus instanceof Error) {
      throw createStatus;
    } else if (createStatus) {
      return {
        IsComplete: true
      }
    }
    return {
      IsComplete: false
    }
  } else if (r.RequestType === 'Update') {
    return {
      IsComplete: true
    }
  }
  return {
    IsComplete: true
  }
}