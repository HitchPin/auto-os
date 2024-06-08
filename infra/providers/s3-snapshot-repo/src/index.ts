import * as lambda from 'aws-lambda';
import * as sm from '@aws-sdk/client-secrets-manager';
import * as os from '@opensearch-project/opensearch';

interface IClusterEp {
  ClusterUrl: string;
  CredsSecret: string;
}
interface Props {
  RepositoryName: string;
  BucketName: string;
  BasePath: string;
  ClusterEndpoint: IClusterEp;
}

const getOsClient = async (adminCredsSecretId: string, clusterUrl: string): Promise<os.Client> => {
  console.log('Creating client with url: ' + clusterUrl);
  const smc = new sm.SecretsManager();
  const s = await smc.getSecretValue({
    SecretId: adminCredsSecretId,
  });
  const creds = JSON.parse(s.SecretString!) as {
    Username: string;
    Password: string
  };
  const url = new URL(clusterUrl);
  var host = url.host;
  var protocol = url.protocol;
  var port = url.port;
  var auth = `${creds.Username}:${encodeURIComponent(creds.Password)}`;
  return new os.Client({
    node: protocol + "//" + auth + "@" + host + ":" + port,
    ssl: {
      rejectUnauthorized: false
    },
  });
}

interface S3Repository {
  type: "s3",
  settings: {
    bucket: string,
    base_path: string
  }
}

const handleCreate = async (props: Props, client: os.Client): Promise<lambda.CdkCustomResourceResponse> => {
  const r = await client.snapshot.create_repository<S3Repository>({
    repository: props.RepositoryName,
    body: {
      type: "s3",
      settings: {
        bucket: props.BucketName,
        base_path: props.BasePath,
      },
    },
  });
  console.log("Create snapshot response:");
  console.log(r);
  return {
    PhysicalResourceId: props.RepositoryName,
  };
}

const handleUpdate = async (
  props: Props,
  client: os.Client
): Promise<lambda.CdkCustomResourceResponse> => {

  await client.snapshot.delete_repository({
    repository: props.RepositoryName
  });
  const r = await client.snapshot.create_repository<S3Repository>({
    repository: props.RepositoryName,
    body: {
      type: "s3",
      settings: {
        bucket: props.BucketName,
        base_path: props.BasePath,
      },
    },
  });
  console.log("Create snapshot response:");
  console.log(r);
  return {
    PhysicalResourceId: props.RepositoryName,
  };
};

const handleDelete = async (
  props: Props,
  client: os.Client
): Promise<lambda.CdkCustomResourceResponse> => {

  await client.snapshot.delete_repository({
    repository: props.RepositoryName
  });
  return {
    PhysicalResourceId: props.RepositoryName,
  };
};

export const handle: lambda.CdkCustomResourceHandler = async (
  req: lambda.CdkCustomResourceEvent, ctx: lambda.Context
): Promise<lambda.CdkCustomResourceResponse> => {

    const props = req.ResourceProperties as unknown as Props;
    const client = await getOsClient(
      props.ClusterEndpoint.CredsSecret,
      props.ClusterEndpoint.ClusterUrl
    );
    
    if (req.RequestType === 'Create') {
      return await handleCreate(props, client);
    } else if (req.RequestType === 'Update') {
      return await handleUpdate(props, client);
    } else {
      return await handleDelete(props, client);
    } 
};

