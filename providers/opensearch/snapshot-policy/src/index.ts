import * as lambda from "aws-lambda";
import * as sm from "@aws-sdk/client-secrets-manager";
import * as os from "@opensearch-project/opensearch";
import type { CreateSnapshotPolicyRequest } from "@auto-os/opensearch-schemas";

interface IClusterEp {
  ClusterUrl: string;
  CredsSecret: string;
}

type Props = CreateSnapshotPolicyRequest & {
  ClusterEndpoint: IClusterEp
}

const getBool = (a: any): boolean | undefined => {
  if (a === undefined || a === null) return undefined;
  if (typeof(a) === 'boolean') return a;
  else if (typeof(a) === 'string') {
    return ['true','yes','enabled'].includes(a.toLocaleLowerCase());
  } else if (typeof(a) === 'number') {
    return a === 1;
  } else {
    throw new Error(`Cannot convert ${a} to bool.`);
  }
}
const toReq = (p: Props): any => {
    const reqWithUndefined = {
      enabled: p.Enabled,
      description: p.Description,
      creation: {
        schedule: {
          cron: {
            expression: p.Creation.Schedule,
            timezone: "UTC",
          },
        },
        time_limit: p.Creation.TimeLimit,
      },
      deletion: !p.Deletion
        ? undefined
        : {
            schedule: {
              cron: {
                expression: p.Deletion.Schedule,
                timezone: "UTC",
              },
            },
            condition: !p.Deletion.Condition
              ? undefined
              : {
                  max_age: p.Deletion.Condition.MaxAge,
                  max_count: p.Deletion.Condition.MaxCount,
                  min_count: p.Deletion.Condition.MinCount,
                },
            time_limit: p.Deletion.TimeLimit,
          },
      notification: !p.Notification
        ? undefined
        : {
            channel: {
              id: p.Notification.Channel?.Id,
            },
            conditions: !p.Notification.Conditions
              ? undefined
              : {
                  creation: getBool(p.Notification.Conditions.Creation),
                  deletion: getBool(p.Notification.Conditions.Deletion),
                  failure: getBool(p.Notification.Conditions.Failure),
                  time_limit_exceeded:
                    p.Notification.Conditions.TimeLimitExceeded,
                },
          },
      snapshot_config: {
        date_format: p.SnapshotConfig.DateFormat,
        date_format_timezone: p.SnapshotConfig.DateFormatTimezone,
        indices: p.SnapshotConfig.Indices?.join(",") ?? undefined,
        repository: p.SnapshotConfig.Repository,
        ignore_unavailable: p.SnapshotConfig.IgnoreUnavailable,
        include_global_state: p.SnapshotConfig.IncludeGlobalState,
        partial: p.SnapshotConfig.Partial,
        metadata: p.SnapshotConfig.Metadata,
      },
    };
    const cleanUndefined = (object: any) => JSON.parse(JSON.stringify(object));
    return cleanUndefined(reqWithUndefined);

}

interface PutSnapshotPolicyResponse {
  _id: string;
  _version: number;
  _seq_no: number;
  _primary_term: number;
  sm_policy: {
    schema_version: number;
    last_updated_time: number,
    enabled_time: number
  };
}

const getOsClient = async (
  adminCredsSecretId: string,
  clusterUrl: string
): Promise<os.Client> => {

  console.log("Creating client with url: " + clusterUrl);
  const smc = new sm.SecretsManager();
  const s = await smc.getSecretValue({
    SecretId: adminCredsSecretId,
  });
  const creds = JSON.parse(s.SecretString!) as {
    Username: string;
    Password: string;
  };
  const url = new URL(clusterUrl);
  var host = url.host;
  var protocol = url.protocol;
  var port = url.port;
  var auth = `${creds.Username}:${encodeURIComponent(creds.Password)}`;
  return new os.Client({
    node: protocol + "//" + auth + "@" + host + ":" + port,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

const createPolicy = async (props: Props, client: os.Client): Promise<string> => {
  const reqBody = toReq(props);
  console.log('Sending request:');
  console.log(reqBody);
  const r = await client.http.post({
    path: `_plugins/_sm/policies/${props.PolicyName}`,
    method: 'POST',
    body: reqBody
  });
  const response = r.body as PutSnapshotPolicyResponse;
  console.log("Create snapshot policy response:");
  console.log(response);
  return `${response._id}:${response._version}:${response._seq_no}:${response._primary_term}`;
}
const deletePolicy = async (props: Props, client: os.Client): Promise<void> => {
  await client.http.delete({
    path: `_plugins/_sm/policies/${props.PolicyName}`,
    method: "DELETE"
  });
}

const handleCreate = async (
  props: Props,
  client: os.Client
): Promise<lambda.CdkCustomResourceResponse> => {
  const policyId = await createPolicy(props, client);
  return {
    PhysicalResourceId: props.PolicyName,
    Data: {
      FullIdentifier: policyId,
    },
  };
};

const handleUpdate = async (
  props: Props,
  client: os.Client
): Promise<lambda.CdkCustomResourceResponse> => {
  await deletePolicy(props, client);
  const policyId = await createPolicy(props, client);
    return {
      PhysicalResourceId: props.PolicyName,
      Data: {
        FullIdentifier: policyId
      }
    };
};

const handleDelete = async (
  props: Props,
  client: os.Client
): Promise<lambda.CdkCustomResourceResponse> => {
  await deletePolicy(props, client);
  return {
    PhysicalResourceId: props.PolicyName
  };
};

export const handle: lambda.CdkCustomResourceHandler = async (
  req: lambda.CdkCustomResourceEvent,
  ctx: lambda.Context
): Promise<lambda.CdkCustomResourceResponse> => {
  const props = req.ResourceProperties as unknown as Props;
  const client = await getOsClient(
    props.ClusterEndpoint.CredsSecret,
    props.ClusterEndpoint.ClusterUrl
  );

  if (req.RequestType === "Create") {
    return await handleCreate(props, client);
  } else if (req.RequestType === "Update") {
    return await handleUpdate(props, client);
  } else {
    return await handleDelete(props, client);
  }
};
