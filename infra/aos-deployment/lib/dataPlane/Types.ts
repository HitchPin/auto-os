import { aws_ec2 as ec2} from 'aws-cdk-lib';
export type ClusterRoleType =
  | "bootstrapper"
  | "cluster_manager"
  | "data"
  | "ml"
  | "coordinator"
  | "ingest"
  | "search"
  | "voting-only";

export interface IAmiProvider {
  amiForInstance: (it: ec2.InstanceType) => ec2.IMachineImage
}