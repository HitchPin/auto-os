import {
  aws_servicecatalog as svcCat,
  aws_iam as iam,
  aws_ecs as ecs,
  aws_ecr as ecr,
  aws_s3 as s3,
  aws_kms as kms,
  custom_resources as cr
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { ClusterCatalogProductStack } from "./ClusterCatalogProductStack";
import { MaestroFuncProduct } from './MaestroFuncProduct';
import { BundledProductAssets } from "../assets";

interface AutoOsOrgPortfolioProps {
  clusterAccountsOuId: string,
  assets: BundledProductAssets,
  versionId: string,
  encryptionKeyId: string
}

const Owner = "HitchPin AutoOs";
export class AutoOsOrgPortfolio extends Construct {

  readonly portfolio: svcCat.Portfolio;
  readonly product: svcCat.CloudFormationProduct;
  readonly controlPlaneProduct: svcCat.CloudFormationProduct;
  readonly shareToken: string;

  constructor(parent: Construct, name: string, props: AutoOsOrgPortfolioProps) {
    super(parent, name);

    const b = s3.Bucket.fromBucketName(this, 'AssetsBucket', props.assets.bucketName);
    const ps = new ClusterCatalogProductStack(this, 'ProductStack', {
      assetBucket: b,
      assets: props.assets,
      encryptionKeyId: props.encryptionKeyId
    });

    const productStackHistory = new svcCat.ProductStackHistory(this, 'ProductStackHistory', {
      productStack: ps,
      currentVersionName: props.versionId,
      currentVersionLocked: false
    });
    
    this.product = new svcCat.CloudFormationProduct(this, 'Product', {
      productName: "OpenSearch Cluster",
      description: 'Automated, self-bootstrapping OpenSearch cluster with the same functionality provided ' +
      'by AWS OpenSearch or Elastic.co\'s managed offering.',
      owner: Owner,
      productVersions: [
        productStackHistory.currentVersion(),
      ],
    });

    const funcProduct = new svcCat.CloudFormationProduct(this, 'FuncProduct', {
      productName: "Maestro Func",
      owner: Owner,
      productVersions: [
        {
          productVersionName: "v1",
          cloudFormationTemplate: svcCat.CloudFormationTemplate.fromProductStack(new MaestroFuncProduct(this, 'MaestroFuncProduct', {
            assetBucket: b,
            orgBucketName: props.assets.bucketName,
            maestroFuncKey: props.assets.controlPlane.maestroFuncKey,
            encryptionKeyId: props.encryptionKeyId
          })),
        },
      ],
      
    });

    this.portfolio = new svcCat.Portfolio(this, 'Portfolio', {
      displayName: 'AutoOs Service Offerings',
      description: 'DIY-managed services from AutoOs',
      providerName: 'hitchpin.com',
    });
    this.portfolio.addProduct(this.product);
    this.portfolio.addProduct(funcProduct);
    
    const orgShare = new cr.AwsCustomResource(this, 'PortfolioOrganizationShare', {
      onCreate: {
        service: 'ServiceCatalog',
        action: 'CreatePortfolioShare',
        parameters: {
          PortfolioId: this.portfolio.portfolioId,
          OrganizationNode: {
            Type: 'ORGANIZATIONAL_UNIT',
            Value: props.clusterAccountsOuId
          }
        },
        physicalResourceId: cr.PhysicalResourceId.of(props.clusterAccountsOuId),
      },
      onDelete: {
        service: 'ServiceCatalog',
        action: 'DeletePortfolioShare',
        parameters: {
          PortfolioId: this.portfolio.portfolioId,
          OrganizationNode: {
            Type: 'ORGANIZATIONAL_UNIT',
            Value: props.clusterAccountsOuId
          }
        },
        physicalResourceId: cr.PhysicalResourceId.of(props.clusterAccountsOuId),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: [
            '*'
          ],
          resources: ['*']
        })
      ])
    });
    this.shareToken = orgShare.getResponseField('PortfolioShareToken');

  }
}
