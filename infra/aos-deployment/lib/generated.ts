/* eslint-disable prettier/prettier,max-len */
import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as cfn_parse from "aws-cdk-lib/core/lib/helpers-internal";

/**
 * An example resource schema demonstrating some basic constructs and validation rules.
 *
 * @cloudformationResource HitchPin::AutoOs::Cluster
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html
 */
export class CfnCluster extends cdk.CfnResource implements cdk.IInspectable {
  /**
   * The CloudFormation resource type name for this resource class.
   */
  public static readonly CFN_RESOURCE_TYPE_NAME: string =
    "HitchPin::AutoOs::Cluster";

  /**
   * Build a CfnCluster from CloudFormation properties
   *
   * A factory method that creates a new instance of this class from an object
   * containing the CloudFormation properties of this resource.
   * Used in the @aws-cdk/cloudformation-include module.
   *
   * @internal
   */
  public static _fromCloudFormation(
    scope: constructs.Construct,
    id: string,
    resourceAttributes: any,
    options: cfn_parse.FromCloudFormationOptions
  ): CfnCluster {
    resourceAttributes = resourceAttributes || {};
    const resourceProperties = options.parser.parseValue(
      resourceAttributes.Properties
    );
    const propsResult = CfnClusterPropsFromCloudFormation(resourceProperties);
    if (cdk.isResolvableObject(propsResult.value)) {
      throw new Error("Unexpected IResolvable");
    }
    const ret = new CfnCluster(scope, id, propsResult.value);
    for (const [propKey, propVal] of Object.entries(
      propsResult.extraProperties
    )) {
      ret.addPropertyOverride(propKey, propVal);
    }
    options.parser.handleAttributes(ret, resourceAttributes, id);
    return ret;
  }

  /**
   * @cloudformationAttribute ClusterEndpoint
   */
  public readonly attrClusterEndpoint: string;

  /**
   * @cloudformationAttribute ClusterId
   */
  public readonly attrClusterId: string;

  public capacity: CfnCluster.CapacityProperty | cdk.IResolvable;

  public clusterName: string;

  public customizations?: CfnCluster.CustomizationsProperty | cdk.IResolvable;

  public logging:
    | CfnCluster.CombinedLoggingProperty
    | CfnCluster.DisabledLoggingProperty
    | CfnCluster.IndividualLoggingProperty
    | cdk.IResolvable;

  public networking: cdk.IResolvable | CfnCluster.NetworkingProperty;

  public security: cdk.IResolvable | CfnCluster.SecurityProperty;

  public snapshots:
    | CfnCluster.DisabledSnapshotsProperty
    | CfnCluster.EnabledSnapshotsProperty
    | cdk.IResolvable;

  /**
   * An array of key-value pairs to apply to this resource.
   */
  public tags?: Array<cdk.CfnTag>;

  public topology: cdk.IResolvable | CfnCluster.TopologyProperty;

  /**
   * @param scope Scope in which this resource is defined
   * @param id Construct identifier for this resource (unique in its scope)
   * @param props Resource properties
   */
  public constructor(
    scope: constructs.Construct,
    id: string,
    props: CfnClusterProps
  ) {
    super(scope, id, {
      type: CfnCluster.CFN_RESOURCE_TYPE_NAME,
      properties: props,
    });

    cdk.requireProperty(props, "capacity", this);
    cdk.requireProperty(props, "clusterName", this);
    cdk.requireProperty(props, "logging", this);
    cdk.requireProperty(props, "networking", this);
    cdk.requireProperty(props, "security", this);
    cdk.requireProperty(props, "snapshots", this);
    cdk.requireProperty(props, "topology", this);

    this.attrClusterEndpoint = cdk.Token.asString(
      this.getAtt("ClusterEndpoint", cdk.ResolutionTypeHint.STRING)
    );
    this.attrClusterId = cdk.Token.asString(
      this.getAtt("ClusterId", cdk.ResolutionTypeHint.STRING)
    );
    this.capacity = props.capacity;
    this.clusterName = props.clusterName;
    this.customizations = props.customizations;
    this.logging = props.logging;
    this.networking = props.networking;
    this.security = props.security;
    this.snapshots = props.snapshots;
    this.tags = props.tags;
    this.topology = props.topology;
  }

  protected get cfnProperties(): Record<string, any> {
    return {
      capacity: this.capacity,
      clusterName: this.clusterName,
      customizations: this.customizations,
      logging: this.logging,
      networking: this.networking,
      security: this.security,
      snapshots: this.snapshots,
      tags: this.tags,
      topology: this.topology,
    };
  }

  /**
   * Examines the CloudFormation resource and discloses attributes
   *
   * @param inspector tree inspector to collect and process attributes
   */
  public inspect(inspector: cdk.TreeInspector): void {
    inspector.addAttribute(
      "aws:cdk:cloudformation:type",
      CfnCluster.CFN_RESOURCE_TYPE_NAME
    );
    inspector.addAttribute("aws:cdk:cloudformation:props", this.cfnProperties);
  }

  protected renderProperties(props: Record<string, any>): Record<string, any> {
    return convertCfnClusterPropsToCloudFormation(props);
  }
}

export namespace CfnCluster {
  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-customizations.html
   */
  export interface CustomizationsProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-customizations.html#cfn-autoos-cluster-customizations-resourcenaming
     */
    readonly resourceNaming?:
      | cdk.IResolvable
      | CfnCluster.ResourceNamingProperty;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-resourcenaming.html
   */
  export interface ResourceNamingProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-resourcenaming.html#cfn-autoos-cluster-resourcenaming-hyphenatedname
     */
    readonly hyphenatedName?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-resourcenaming.html#cfn-autoos-cluster-resourcenaming-qualifiedprefix
     */
    readonly qualifiedPrefix?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-resourcenaming.html#cfn-autoos-cluster-resourcenaming-titleprefix
     */
    readonly titlePrefix?: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-networking.html
   */
  export interface NetworkingProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-networking.html#cfn-autoos-cluster-networking-securitygroupids
     */
    readonly securityGroupIds: Array<string>;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-networking.html#cfn-autoos-cluster-networking-subnetids
     */
    readonly subnetIds: Array<string>;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-networking.html#cfn-autoos-cluster-networking-vpcid
     */
    readonly vpcId: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-enabledsnapshots.html
   */
  export interface EnabledSnapshotsProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-enabledsnapshots.html#cfn-autoos-cluster-enabledsnapshots-bucketname
     */
    readonly bucketName: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-enabledsnapshots.html#cfn-autoos-cluster-enabledsnapshots-enabled
     */
    readonly enabled: boolean | cdk.IResolvable;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-enabledsnapshots.html#cfn-autoos-cluster-enabledsnapshots-prefix
     */
    readonly prefix?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-enabledsnapshots.html#cfn-autoos-cluster-enabledsnapshots-schedule
     */
    readonly schedule: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-disabledsnapshots.html
   */
  export interface DisabledSnapshotsProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-disabledsnapshots.html#cfn-autoos-cluster-disabledsnapshots-enabled
     */
    readonly enabled: boolean | cdk.IResolvable;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-disabledlogging.html
   */
  export interface DisabledLoggingProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-disabledlogging.html#cfn-autoos-cluster-disabledlogging-enabled
     */
    readonly enabled: boolean | cdk.IResolvable;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individuallogging.html
   */
  export interface IndividualLoggingProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individuallogging.html#cfn-autoos-cluster-individuallogging-enabled
     */
    readonly enabled: boolean | cdk.IResolvable;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individuallogging.html#cfn-autoos-cluster-individuallogging-loggroupnames
     */
    readonly logGroupNames:
      | CfnCluster.IndividualLogGroupNamesProperty
      | cdk.IResolvable;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individualloggroupnames.html
   */
  export interface IndividualLogGroupNamesProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individualloggroupnames.html#cfn-autoos-cluster-individualloggroupnames-indexingslow
     */
    readonly indexingSlow?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individualloggroupnames.html#cfn-autoos-cluster-individualloggroupnames-search
     */
    readonly search?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individualloggroupnames.html#cfn-autoos-cluster-individualloggroupnames-searchserver
     */
    readonly searchServer?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individualloggroupnames.html#cfn-autoos-cluster-individualloggroupnames-searchslow
     */
    readonly searchSlow?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-individualloggroupnames.html#cfn-autoos-cluster-individualloggroupnames-taskdetails
     */
    readonly taskDetails?: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-combinedlogging.html
   */
  export interface CombinedLoggingProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-combinedlogging.html#cfn-autoos-cluster-combinedlogging-enabled
     */
    readonly enabled: boolean | cdk.IResolvable;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-combinedlogging.html#cfn-autoos-cluster-combinedlogging-loggroupname
     */
    readonly logGroupName: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-security.html
   */
  export interface SecurityProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-security.html#cfn-autoos-cluster-security-encryptionkeyid
     */
    readonly encryptionKeyId: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-security.html#cfn-autoos-cluster-security-superadmincredentialssecretid
     */
    readonly superAdminCredentialsSecretId: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-capacity.html
   */
  export interface CapacityProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-capacity.html#cfn-autoos-cluster-capacity-providers
     */
    readonly providers:
      | Array<
          | CfnCluster.EC2AutoScalingCapacityProviderProperty
          | CfnCluster.FargateCapacityProviderProperty
          | cdk.IResolvable
        >
      | cdk.IResolvable;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-fargatecapacityprovider.html
   */
  export interface FargateCapacityProviderProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-fargatecapacityprovider.html#cfn-autoos-cluster-fargatecapacityprovider-cpuarchitecture
     */
    readonly cpuArchitecture: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-fargatecapacityprovider.html#cfn-autoos-cluster-fargatecapacityprovider-memorymb
     */
    readonly memoryMb: number;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-fargatecapacityprovider.html#cfn-autoos-cluster-fargatecapacityprovider-type
     */
    readonly type: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-fargatecapacityprovider.html#cfn-autoos-cluster-fargatecapacityprovider-vcpus
     */
    readonly vcpUs: number;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-ec2autoscalingcapacityprovider.html
   */
  export interface EC2AutoScalingCapacityProviderProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-ec2autoscalingcapacityprovider.html#cfn-autoos-cluster-ec2autoscalingcapacityprovider-instancetype
     */
    readonly instanceType: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-ec2autoscalingcapacityprovider.html#cfn-autoos-cluster-ec2autoscalingcapacityprovider-type
     */
    readonly type: string;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-topology.html
   */
  export interface TopologyProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-topology.html#cfn-autoos-cluster-topology-nodespecifications
     */
    readonly nodeSpecifications:
      | Array<cdk.IResolvable | CfnCluster.NodeSpecProperty>
      | cdk.IResolvable;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-topology.html#cfn-autoos-cluster-topology-zoneawareness
     */
    readonly zoneAwareness?: boolean | cdk.IResolvable;
  }

  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-nodespec.html
   */
  export interface NodeSpecProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-nodespec.html#cfn-autoos-cluster-nodespec-capacityprovidername
     */
    readonly capacityProviderName: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-nodespec.html#cfn-autoos-cluster-nodespec-maxcount
     */
    readonly maxCount: number;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-nodespec.html#cfn-autoos-cluster-nodespec-mincount
     */
    readonly minCount: number;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-cluster-nodespec.html#cfn-autoos-cluster-nodespec-type
     */
    readonly type: Array<string> | cdk.IResolvable | string;
  }
}

/**
 * Properties for defining a `CfnCluster`
 *
 * @struct
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html
 */
export interface CfnClusterProps {
  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-capacity
   */
  readonly capacity: CfnCluster.CapacityProperty | cdk.IResolvable;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-clustername
   */
  readonly clusterName: string;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-customizations
   */
  readonly customizations?: CfnCluster.CustomizationsProperty | cdk.IResolvable;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-logging
   */
  readonly logging:
    | CfnCluster.CombinedLoggingProperty
    | CfnCluster.DisabledLoggingProperty
    | CfnCluster.IndividualLoggingProperty
    | cdk.IResolvable;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-networking
   */
  readonly networking: cdk.IResolvable | CfnCluster.NetworkingProperty;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-security
   */
  readonly security: cdk.IResolvable | CfnCluster.SecurityProperty;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-snapshots
   */
  readonly snapshots:
    | CfnCluster.DisabledSnapshotsProperty
    | CfnCluster.EnabledSnapshotsProperty
    | cdk.IResolvable;

  /**
   * An array of key-value pairs to apply to this resource.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-tags
   */
  readonly tags?: Array<cdk.CfnTag>;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-cluster.html#cfn-autoos-cluster-topology
   */
  readonly topology: cdk.IResolvable | CfnCluster.TopologyProperty;
}

/**
 * Determine whether the given properties match those of a `ResourceNamingProperty`
 *
 * @param properties - the TypeScript properties of a `ResourceNamingProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterResourceNamingPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "hyphenatedName",
      cdk.validateString
    )(properties.hyphenatedName)
  );
  errors.collect(
    cdk.propertyValidator(
      "qualifiedPrefix",
      cdk.validateString
    )(properties.qualifiedPrefix)
  );
  errors.collect(
    cdk.propertyValidator(
      "titlePrefix",
      cdk.validateString
    )(properties.titlePrefix)
  );
  return errors.wrap(
    'supplied properties not correct for "ResourceNamingProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterResourceNamingPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterResourceNamingPropertyValidator(properties).assertSuccess();
  return {
    HyphenatedName: cdk.stringToCloudFormation(properties.hyphenatedName),
    QualifiedPrefix: cdk.stringToCloudFormation(properties.qualifiedPrefix),
    TitlePrefix: cdk.stringToCloudFormation(properties.titlePrefix),
  };
}

// @ts-ignore TS6133
function CfnClusterResourceNamingPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  cdk.IResolvable | CfnCluster.ResourceNamingProperty
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.ResourceNamingProperty>();
  ret.addPropertyResult(
    "hyphenatedName",
    "HyphenatedName",
    properties.HyphenatedName != null
      ? cfn_parse.FromCloudFormation.getString(properties.HyphenatedName)
      : undefined
  );
  ret.addPropertyResult(
    "qualifiedPrefix",
    "QualifiedPrefix",
    properties.QualifiedPrefix != null
      ? cfn_parse.FromCloudFormation.getString(properties.QualifiedPrefix)
      : undefined
  );
  ret.addPropertyResult(
    "titlePrefix",
    "TitlePrefix",
    properties.TitlePrefix != null
      ? cfn_parse.FromCloudFormation.getString(properties.TitlePrefix)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `CustomizationsProperty`
 *
 * @param properties - the TypeScript properties of a `CustomizationsProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterCustomizationsPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "resourceNaming",
      CfnClusterResourceNamingPropertyValidator
    )(properties.resourceNaming)
  );
  return errors.wrap(
    'supplied properties not correct for "CustomizationsProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterCustomizationsPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterCustomizationsPropertyValidator(properties).assertSuccess();
  return {
    ResourceNaming: convertCfnClusterResourceNamingPropertyToCloudFormation(
      properties.resourceNaming
    ),
  };
}

// @ts-ignore TS6133
function CfnClusterCustomizationsPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.CustomizationsProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.CustomizationsProperty>();
  ret.addPropertyResult(
    "resourceNaming",
    "ResourceNaming",
    properties.ResourceNaming != null
      ? CfnClusterResourceNamingPropertyFromCloudFormation(
          properties.ResourceNaming
        )
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `NetworkingProperty`
 *
 * @param properties - the TypeScript properties of a `NetworkingProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterNetworkingPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "securityGroupIds",
      cdk.requiredValidator
    )(properties.securityGroupIds)
  );
  errors.collect(
    cdk.propertyValidator(
      "securityGroupIds",
      cdk.listValidator(cdk.validateString)
    )(properties.securityGroupIds)
  );
  errors.collect(
    cdk.propertyValidator(
      "subnetIds",
      cdk.requiredValidator
    )(properties.subnetIds)
  );
  errors.collect(
    cdk.propertyValidator(
      "subnetIds",
      cdk.listValidator(cdk.validateString)
    )(properties.subnetIds)
  );
  errors.collect(
    cdk.propertyValidator("vpcId", cdk.requiredValidator)(properties.vpcId)
  );
  errors.collect(
    cdk.propertyValidator("vpcId", cdk.validateString)(properties.vpcId)
  );
  return errors.wrap(
    'supplied properties not correct for "NetworkingProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterNetworkingPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterNetworkingPropertyValidator(properties).assertSuccess();
  return {
    SecurityGroupIds: cdk.listMapper(cdk.stringToCloudFormation)(
      properties.securityGroupIds
    ),
    SubnetIds: cdk.listMapper(cdk.stringToCloudFormation)(properties.subnetIds),
    VpcId: cdk.stringToCloudFormation(properties.vpcId),
  };
}

// @ts-ignore TS6133
function CfnClusterNetworkingPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  cdk.IResolvable | CfnCluster.NetworkingProperty
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.NetworkingProperty>();
  ret.addPropertyResult(
    "securityGroupIds",
    "SecurityGroupIds",
    properties.SecurityGroupIds != null
      ? cfn_parse.FromCloudFormation.getArray(
          cfn_parse.FromCloudFormation.getString
        )(properties.SecurityGroupIds)
      : undefined
  );
  ret.addPropertyResult(
    "subnetIds",
    "SubnetIds",
    properties.SubnetIds != null
      ? cfn_parse.FromCloudFormation.getArray(
          cfn_parse.FromCloudFormation.getString
        )(properties.SubnetIds)
      : undefined
  );
  ret.addPropertyResult(
    "vpcId",
    "VpcId",
    properties.VpcId != null
      ? cfn_parse.FromCloudFormation.getString(properties.VpcId)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `EnabledSnapshotsProperty`
 *
 * @param properties - the TypeScript properties of a `EnabledSnapshotsProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterEnabledSnapshotsPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "bucketName",
      cdk.requiredValidator
    )(properties.bucketName)
  );
  errors.collect(
    cdk.propertyValidator(
      "bucketName",
      cdk.validateString
    )(properties.bucketName)
  );
  errors.collect(
    cdk.propertyValidator("enabled", cdk.requiredValidator)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator("enabled", cdk.validateBoolean)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator("prefix", cdk.validateString)(properties.prefix)
  );
  errors.collect(
    cdk.propertyValidator(
      "schedule",
      cdk.requiredValidator
    )(properties.schedule)
  );
  errors.collect(
    cdk.propertyValidator("schedule", cdk.validateString)(properties.schedule)
  );
  return errors.wrap(
    'supplied properties not correct for "EnabledSnapshotsProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterEnabledSnapshotsPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterEnabledSnapshotsPropertyValidator(properties).assertSuccess();
  return {
    BucketName: cdk.stringToCloudFormation(properties.bucketName),
    Enabled: cdk.booleanToCloudFormation(properties.enabled),
    Prefix: cdk.stringToCloudFormation(properties.prefix),
    Schedule: cdk.stringToCloudFormation(properties.schedule),
  };
}

// @ts-ignore TS6133
function CfnClusterEnabledSnapshotsPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.EnabledSnapshotsProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.EnabledSnapshotsProperty>();
  ret.addPropertyResult(
    "bucketName",
    "BucketName",
    properties.BucketName != null
      ? cfn_parse.FromCloudFormation.getString(properties.BucketName)
      : undefined
  );
  ret.addPropertyResult(
    "enabled",
    "Enabled",
    properties.Enabled != null
      ? cfn_parse.FromCloudFormation.getBoolean(properties.Enabled)
      : undefined
  );
  ret.addPropertyResult(
    "prefix",
    "Prefix",
    properties.Prefix != null
      ? cfn_parse.FromCloudFormation.getString(properties.Prefix)
      : undefined
  );
  ret.addPropertyResult(
    "schedule",
    "Schedule",
    properties.Schedule != null
      ? cfn_parse.FromCloudFormation.getString(properties.Schedule)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `DisabledSnapshotsProperty`
 *
 * @param properties - the TypeScript properties of a `DisabledSnapshotsProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterDisabledSnapshotsPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator("enabled", cdk.requiredValidator)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator("enabled", cdk.validateBoolean)(properties.enabled)
  );
  return errors.wrap(
    'supplied properties not correct for "DisabledSnapshotsProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterDisabledSnapshotsPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterDisabledSnapshotsPropertyValidator(properties).assertSuccess();
  return {
    Enabled: cdk.booleanToCloudFormation(properties.enabled),
  };
}

// @ts-ignore TS6133
function CfnClusterDisabledSnapshotsPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.DisabledSnapshotsProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.DisabledSnapshotsProperty>();
  ret.addPropertyResult(
    "enabled",
    "Enabled",
    properties.Enabled != null
      ? cfn_parse.FromCloudFormation.getBoolean(properties.Enabled)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `DisabledLoggingProperty`
 *
 * @param properties - the TypeScript properties of a `DisabledLoggingProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterDisabledLoggingPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator("enabled", cdk.requiredValidator)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator("enabled", cdk.validateBoolean)(properties.enabled)
  );
  return errors.wrap(
    'supplied properties not correct for "DisabledLoggingProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterDisabledLoggingPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterDisabledLoggingPropertyValidator(properties).assertSuccess();
  return {
    Enabled: cdk.booleanToCloudFormation(properties.enabled),
  };
}

// @ts-ignore TS6133
function CfnClusterDisabledLoggingPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.DisabledLoggingProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.DisabledLoggingProperty>();
  ret.addPropertyResult(
    "enabled",
    "Enabled",
    properties.Enabled != null
      ? cfn_parse.FromCloudFormation.getBoolean(properties.Enabled)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `IndividualLogGroupNamesProperty`
 *
 * @param properties - the TypeScript properties of a `IndividualLogGroupNamesProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterIndividualLogGroupNamesPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "indexingSlow",
      cdk.validateString
    )(properties.indexingSlow)
  );
  errors.collect(
    cdk.propertyValidator("search", cdk.validateString)(properties.search)
  );
  errors.collect(
    cdk.propertyValidator(
      "searchServer",
      cdk.validateString
    )(properties.searchServer)
  );
  errors.collect(
    cdk.propertyValidator(
      "searchSlow",
      cdk.validateString
    )(properties.searchSlow)
  );
  errors.collect(
    cdk.propertyValidator(
      "taskDetails",
      cdk.validateString
    )(properties.taskDetails)
  );
  return errors.wrap(
    'supplied properties not correct for "IndividualLogGroupNamesProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterIndividualLogGroupNamesPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterIndividualLogGroupNamesPropertyValidator(
    properties
  ).assertSuccess();
  return {
    IndexingSlow: cdk.stringToCloudFormation(properties.indexingSlow),
    Search: cdk.stringToCloudFormation(properties.search),
    SearchServer: cdk.stringToCloudFormation(properties.searchServer),
    SearchSlow: cdk.stringToCloudFormation(properties.searchSlow),
    TaskDetails: cdk.stringToCloudFormation(properties.taskDetails),
  };
}

// @ts-ignore TS6133
function CfnClusterIndividualLogGroupNamesPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.IndividualLogGroupNamesProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.IndividualLogGroupNamesProperty>();
  ret.addPropertyResult(
    "indexingSlow",
    "IndexingSlow",
    properties.IndexingSlow != null
      ? cfn_parse.FromCloudFormation.getString(properties.IndexingSlow)
      : undefined
  );
  ret.addPropertyResult(
    "search",
    "Search",
    properties.Search != null
      ? cfn_parse.FromCloudFormation.getString(properties.Search)
      : undefined
  );
  ret.addPropertyResult(
    "searchServer",
    "SearchServer",
    properties.SearchServer != null
      ? cfn_parse.FromCloudFormation.getString(properties.SearchServer)
      : undefined
  );
  ret.addPropertyResult(
    "searchSlow",
    "SearchSlow",
    properties.SearchSlow != null
      ? cfn_parse.FromCloudFormation.getString(properties.SearchSlow)
      : undefined
  );
  ret.addPropertyResult(
    "taskDetails",
    "TaskDetails",
    properties.TaskDetails != null
      ? cfn_parse.FromCloudFormation.getString(properties.TaskDetails)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `IndividualLoggingProperty`
 *
 * @param properties - the TypeScript properties of a `IndividualLoggingProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterIndividualLoggingPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator("enabled", cdk.requiredValidator)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator("enabled", cdk.validateBoolean)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator(
      "logGroupNames",
      cdk.requiredValidator
    )(properties.logGroupNames)
  );
  errors.collect(
    cdk.propertyValidator(
      "logGroupNames",
      CfnClusterIndividualLogGroupNamesPropertyValidator
    )(properties.logGroupNames)
  );
  return errors.wrap(
    'supplied properties not correct for "IndividualLoggingProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterIndividualLoggingPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterIndividualLoggingPropertyValidator(properties).assertSuccess();
  return {
    Enabled: cdk.booleanToCloudFormation(properties.enabled),
    LogGroupNames:
      convertCfnClusterIndividualLogGroupNamesPropertyToCloudFormation(
        properties.logGroupNames
      ),
  };
}

// @ts-ignore TS6133
function CfnClusterIndividualLoggingPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.IndividualLoggingProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.IndividualLoggingProperty>();
  ret.addPropertyResult(
    "enabled",
    "Enabled",
    properties.Enabled != null
      ? cfn_parse.FromCloudFormation.getBoolean(properties.Enabled)
      : undefined
  );
  ret.addPropertyResult(
    "logGroupNames",
    "LogGroupNames",
    properties.LogGroupNames != null
      ? CfnClusterIndividualLogGroupNamesPropertyFromCloudFormation(
          properties.LogGroupNames
        )
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `CombinedLoggingProperty`
 *
 * @param properties - the TypeScript properties of a `CombinedLoggingProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterCombinedLoggingPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator("enabled", cdk.requiredValidator)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator("enabled", cdk.validateBoolean)(properties.enabled)
  );
  errors.collect(
    cdk.propertyValidator(
      "logGroupName",
      cdk.requiredValidator
    )(properties.logGroupName)
  );
  errors.collect(
    cdk.propertyValidator(
      "logGroupName",
      cdk.validateString
    )(properties.logGroupName)
  );
  return errors.wrap(
    'supplied properties not correct for "CombinedLoggingProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterCombinedLoggingPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterCombinedLoggingPropertyValidator(properties).assertSuccess();
  return {
    Enabled: cdk.booleanToCloudFormation(properties.enabled),
    LogGroupName: cdk.stringToCloudFormation(properties.logGroupName),
  };
}

// @ts-ignore TS6133
function CfnClusterCombinedLoggingPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.CombinedLoggingProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.CombinedLoggingProperty>();
  ret.addPropertyResult(
    "enabled",
    "Enabled",
    properties.Enabled != null
      ? cfn_parse.FromCloudFormation.getBoolean(properties.Enabled)
      : undefined
  );
  ret.addPropertyResult(
    "logGroupName",
    "LogGroupName",
    properties.LogGroupName != null
      ? cfn_parse.FromCloudFormation.getString(properties.LogGroupName)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `SecurityProperty`
 *
 * @param properties - the TypeScript properties of a `SecurityProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterSecurityPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "encryptionKeyId",
      cdk.requiredValidator
    )(properties.encryptionKeyId)
  );
  errors.collect(
    cdk.propertyValidator(
      "encryptionKeyId",
      cdk.validateString
    )(properties.encryptionKeyId)
  );
  errors.collect(
    cdk.propertyValidator(
      "superAdminCredentialsSecretId",
      cdk.requiredValidator
    )(properties.superAdminCredentialsSecretId)
  );
  errors.collect(
    cdk.propertyValidator(
      "superAdminCredentialsSecretId",
      cdk.validateString
    )(properties.superAdminCredentialsSecretId)
  );
  return errors.wrap('supplied properties not correct for "SecurityProperty"');
}

// @ts-ignore TS6133
function convertCfnClusterSecurityPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterSecurityPropertyValidator(properties).assertSuccess();
  return {
    EncryptionKeyId: cdk.stringToCloudFormation(properties.encryptionKeyId),
    SuperAdminCredentialsSecretId: cdk.stringToCloudFormation(
      properties.superAdminCredentialsSecretId
    ),
  };
}

// @ts-ignore TS6133
function CfnClusterSecurityPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  cdk.IResolvable | CfnCluster.SecurityProperty
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.SecurityProperty>();
  ret.addPropertyResult(
    "encryptionKeyId",
    "EncryptionKeyId",
    properties.EncryptionKeyId != null
      ? cfn_parse.FromCloudFormation.getString(properties.EncryptionKeyId)
      : undefined
  );
  ret.addPropertyResult(
    "superAdminCredentialsSecretId",
    "SuperAdminCredentialsSecretId",
    properties.SuperAdminCredentialsSecretId != null
      ? cfn_parse.FromCloudFormation.getString(
          properties.SuperAdminCredentialsSecretId
        )
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `FargateCapacityProviderProperty`
 *
 * @param properties - the TypeScript properties of a `FargateCapacityProviderProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterFargateCapacityProviderPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "cpuArchitecture",
      cdk.requiredValidator
    )(properties.cpuArchitecture)
  );
  errors.collect(
    cdk.propertyValidator(
      "cpuArchitecture",
      cdk.validateString
    )(properties.cpuArchitecture)
  );
  errors.collect(
    cdk.propertyValidator(
      "memoryMb",
      cdk.requiredValidator
    )(properties.memoryMb)
  );
  errors.collect(
    cdk.propertyValidator("memoryMb", cdk.validateNumber)(properties.memoryMb)
  );
  errors.collect(
    cdk.propertyValidator("type", cdk.requiredValidator)(properties.type)
  );
  errors.collect(
    cdk.propertyValidator("type", cdk.validateString)(properties.type)
  );
  errors.collect(
    cdk.propertyValidator("vcpUs", cdk.requiredValidator)(properties.vcpUs)
  );
  errors.collect(
    cdk.propertyValidator("vcpUs", cdk.validateNumber)(properties.vcpUs)
  );
  return errors.wrap(
    'supplied properties not correct for "FargateCapacityProviderProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterFargateCapacityProviderPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterFargateCapacityProviderPropertyValidator(
    properties
  ).assertSuccess();
  return {
    CPUArchitecture: cdk.stringToCloudFormation(properties.cpuArchitecture),
    MemoryMB: cdk.numberToCloudFormation(properties.memoryMb),
    Type: cdk.stringToCloudFormation(properties.type),
    VCPUs: cdk.numberToCloudFormation(properties.vcpUs),
  };
}

// @ts-ignore TS6133
function CfnClusterFargateCapacityProviderPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.FargateCapacityProviderProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.FargateCapacityProviderProperty>();
  ret.addPropertyResult(
    "cpuArchitecture",
    "CPUArchitecture",
    properties.CPUArchitecture != null
      ? cfn_parse.FromCloudFormation.getString(properties.CPUArchitecture)
      : undefined
  );
  ret.addPropertyResult(
    "memoryMb",
    "MemoryMB",
    properties.MemoryMB != null
      ? cfn_parse.FromCloudFormation.getNumber(properties.MemoryMB)
      : undefined
  );
  ret.addPropertyResult(
    "type",
    "Type",
    properties.Type != null
      ? cfn_parse.FromCloudFormation.getString(properties.Type)
      : undefined
  );
  ret.addPropertyResult(
    "vcpUs",
    "VCPUs",
    properties.VCPUs != null
      ? cfn_parse.FromCloudFormation.getNumber(properties.VCPUs)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `EC2AutoScalingCapacityProviderProperty`
 *
 * @param properties - the TypeScript properties of a `EC2AutoScalingCapacityProviderProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterEC2AutoScalingCapacityProviderPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "instanceType",
      cdk.requiredValidator
    )(properties.instanceType)
  );
  errors.collect(
    cdk.propertyValidator(
      "instanceType",
      cdk.validateString
    )(properties.instanceType)
  );
  errors.collect(
    cdk.propertyValidator("type", cdk.requiredValidator)(properties.type)
  );
  errors.collect(
    cdk.propertyValidator("type", cdk.validateString)(properties.type)
  );
  return errors.wrap(
    'supplied properties not correct for "EC2AutoScalingCapacityProviderProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnClusterEC2AutoScalingCapacityProviderPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterEC2AutoScalingCapacityProviderPropertyValidator(
    properties
  ).assertSuccess();
  return {
    InstanceType: cdk.stringToCloudFormation(properties.instanceType),
    Type: cdk.stringToCloudFormation(properties.type),
  };
}

// @ts-ignore TS6133
function CfnClusterEC2AutoScalingCapacityProviderPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.EC2AutoScalingCapacityProviderProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.EC2AutoScalingCapacityProviderProperty>();
  ret.addPropertyResult(
    "instanceType",
    "InstanceType",
    properties.InstanceType != null
      ? cfn_parse.FromCloudFormation.getString(properties.InstanceType)
      : undefined
  );
  ret.addPropertyResult(
    "type",
    "Type",
    properties.Type != null
      ? cfn_parse.FromCloudFormation.getString(properties.Type)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `CapacityProperty`
 *
 * @param properties - the TypeScript properties of a `CapacityProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterCapacityPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "providers",
      cdk.requiredValidator
    )(properties.providers)
  );
  errors.collect(
    cdk.propertyValidator(
      "providers",
      cdk.listValidator(
        cdk.unionValidator(
          CfnClusterFargateCapacityProviderPropertyValidator,
          CfnClusterEC2AutoScalingCapacityProviderPropertyValidator
        )
      )
    )(properties.providers)
  );
  return errors.wrap('supplied properties not correct for "CapacityProperty"');
}

// @ts-ignore TS6133
function convertCfnClusterCapacityPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterCapacityPropertyValidator(properties).assertSuccess();
  return {
    Providers: cdk.listMapper(
      cdk.unionMapper(
        [
          CfnClusterFargateCapacityProviderPropertyValidator,
          CfnClusterEC2AutoScalingCapacityProviderPropertyValidator,
        ],
        [
          convertCfnClusterFargateCapacityProviderPropertyToCloudFormation,
          convertCfnClusterEC2AutoScalingCapacityProviderPropertyToCloudFormation,
        ]
      )
    )(properties.providers),
  };
}

// @ts-ignore TS6133
function CfnClusterCapacityPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnCluster.CapacityProperty | cdk.IResolvable
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.CapacityProperty>();
  ret.addPropertyResult(
    "providers",
    "Providers",
    properties.Providers != null
      ? cfn_parse.FromCloudFormation.getArray(
          cfn_parse.FromCloudFormation.getTypeUnion(
            [
              CfnClusterFargateCapacityProviderPropertyValidator,
              CfnClusterEC2AutoScalingCapacityProviderPropertyValidator,
            ],
            [
              CfnClusterFargateCapacityProviderPropertyFromCloudFormation,
              CfnClusterEC2AutoScalingCapacityProviderPropertyFromCloudFormation,
            ]
          )
        )(properties.Providers)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `NodeSpecProperty`
 *
 * @param properties - the TypeScript properties of a `NodeSpecProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterNodeSpecPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "capacityProviderName",
      cdk.requiredValidator
    )(properties.capacityProviderName)
  );
  errors.collect(
    cdk.propertyValidator(
      "capacityProviderName",
      cdk.validateString
    )(properties.capacityProviderName)
  );
  errors.collect(
    cdk.propertyValidator(
      "maxCount",
      cdk.requiredValidator
    )(properties.maxCount)
  );
  errors.collect(
    cdk.propertyValidator("maxCount", cdk.validateNumber)(properties.maxCount)
  );
  errors.collect(
    cdk.propertyValidator(
      "minCount",
      cdk.requiredValidator
    )(properties.minCount)
  );
  errors.collect(
    cdk.propertyValidator("minCount", cdk.validateNumber)(properties.minCount)
  );
  errors.collect(
    cdk.propertyValidator("type", cdk.requiredValidator)(properties.type)
  );
  errors.collect(
    cdk.propertyValidator(
      "type",
      cdk.unionValidator(
        cdk.listValidator(cdk.validateString),
        cdk.validateString
      )
    )(properties.type)
  );
  return errors.wrap('supplied properties not correct for "NodeSpecProperty"');
}

// @ts-ignore TS6133
function convertCfnClusterNodeSpecPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterNodeSpecPropertyValidator(properties).assertSuccess();
  return {
    CapacityProviderName: cdk.stringToCloudFormation(
      properties.capacityProviderName
    ),
    MaxCount: cdk.numberToCloudFormation(properties.maxCount),
    MinCount: cdk.numberToCloudFormation(properties.minCount),
    Type: cdk.unionMapper(
      [cdk.listValidator(cdk.validateString), cdk.validateString],
      [cdk.listMapper(cdk.stringToCloudFormation), cdk.stringToCloudFormation]
    )(properties.type),
  };
}

// @ts-ignore TS6133
function CfnClusterNodeSpecPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  cdk.IResolvable | CfnCluster.NodeSpecProperty
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.NodeSpecProperty>();
  ret.addPropertyResult(
    "capacityProviderName",
    "CapacityProviderName",
    properties.CapacityProviderName != null
      ? cfn_parse.FromCloudFormation.getString(properties.CapacityProviderName)
      : undefined
  );
  ret.addPropertyResult(
    "maxCount",
    "MaxCount",
    properties.MaxCount != null
      ? cfn_parse.FromCloudFormation.getNumber(properties.MaxCount)
      : undefined
  );
  ret.addPropertyResult(
    "minCount",
    "MinCount",
    properties.MinCount != null
      ? cfn_parse.FromCloudFormation.getNumber(properties.MinCount)
      : undefined
  );
  ret.addPropertyResult(
    "type",
    "Type",
    properties.Type != null
      ? cfn_parse.FromCloudFormation.getTypeUnion(
          [cdk.listValidator(cdk.validateString), cdk.validateString],
          [
            cfn_parse.FromCloudFormation.getArray(
              cfn_parse.FromCloudFormation.getString
            ),
            cfn_parse.FromCloudFormation.getString,
          ]
        )(properties.Type)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `TopologyProperty`
 *
 * @param properties - the TypeScript properties of a `TopologyProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterTopologyPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "nodeSpecifications",
      cdk.requiredValidator
    )(properties.nodeSpecifications)
  );
  errors.collect(
    cdk.propertyValidator(
      "nodeSpecifications",
      cdk.listValidator(CfnClusterNodeSpecPropertyValidator)
    )(properties.nodeSpecifications)
  );
  errors.collect(
    cdk.propertyValidator(
      "zoneAwareness",
      cdk.validateBoolean
    )(properties.zoneAwareness)
  );
  return errors.wrap('supplied properties not correct for "TopologyProperty"');
}

// @ts-ignore TS6133
function convertCfnClusterTopologyPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterTopologyPropertyValidator(properties).assertSuccess();
  return {
    NodeSpecifications: cdk.listMapper(
      convertCfnClusterNodeSpecPropertyToCloudFormation
    )(properties.nodeSpecifications),
    ZoneAwareness: cdk.booleanToCloudFormation(properties.zoneAwareness),
  };
}

// @ts-ignore TS6133
function CfnClusterTopologyPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  cdk.IResolvable | CfnCluster.TopologyProperty
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnCluster.TopologyProperty>();
  ret.addPropertyResult(
    "nodeSpecifications",
    "NodeSpecifications",
    properties.NodeSpecifications != null
      ? cfn_parse.FromCloudFormation.getArray(
          CfnClusterNodeSpecPropertyFromCloudFormation
        )(properties.NodeSpecifications)
      : undefined
  );
  ret.addPropertyResult(
    "zoneAwareness",
    "ZoneAwareness",
    properties.ZoneAwareness != null
      ? cfn_parse.FromCloudFormation.getBoolean(properties.ZoneAwareness)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `CfnClusterProps`
 *
 * @param properties - the TypeScript properties of a `CfnClusterProps`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnClusterPropsValidator(properties: any): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "capacity",
      cdk.requiredValidator
    )(properties.capacity)
  );
  errors.collect(
    cdk.propertyValidator(
      "capacity",
      CfnClusterCapacityPropertyValidator
    )(properties.capacity)
  );
  errors.collect(
    cdk.propertyValidator(
      "clusterName",
      cdk.requiredValidator
    )(properties.clusterName)
  );
  errors.collect(
    cdk.propertyValidator(
      "clusterName",
      cdk.validateString
    )(properties.clusterName)
  );
  errors.collect(
    cdk.propertyValidator(
      "customizations",
      CfnClusterCustomizationsPropertyValidator
    )(properties.customizations)
  );
  errors.collect(
    cdk.propertyValidator("logging", cdk.requiredValidator)(properties.logging)
  );
  errors.collect(
    cdk.propertyValidator(
      "logging",
      cdk.unionValidator(
        CfnClusterCombinedLoggingPropertyValidator,
        CfnClusterIndividualLoggingPropertyValidator,
        CfnClusterDisabledLoggingPropertyValidator
      )
    )(properties.logging)
  );
  errors.collect(
    cdk.propertyValidator(
      "networking",
      cdk.requiredValidator
    )(properties.networking)
  );
  errors.collect(
    cdk.propertyValidator(
      "networking",
      CfnClusterNetworkingPropertyValidator
    )(properties.networking)
  );
  errors.collect(
    cdk.propertyValidator(
      "security",
      cdk.requiredValidator
    )(properties.security)
  );
  errors.collect(
    cdk.propertyValidator(
      "security",
      CfnClusterSecurityPropertyValidator
    )(properties.security)
  );
  errors.collect(
    cdk.propertyValidator(
      "snapshots",
      cdk.requiredValidator
    )(properties.snapshots)
  );
  errors.collect(
    cdk.propertyValidator(
      "snapshots",
      cdk.unionValidator(
        CfnClusterEnabledSnapshotsPropertyValidator,
        CfnClusterDisabledSnapshotsPropertyValidator
      )
    )(properties.snapshots)
  );
  errors.collect(
    cdk.propertyValidator(
      "tags",
      cdk.listValidator(cdk.validateCfnTag)
    )(properties.tags)
  );
  errors.collect(
    cdk.propertyValidator(
      "topology",
      cdk.requiredValidator
    )(properties.topology)
  );
  errors.collect(
    cdk.propertyValidator(
      "topology",
      CfnClusterTopologyPropertyValidator
    )(properties.topology)
  );
  return errors.wrap('supplied properties not correct for "CfnClusterProps"');
}

// @ts-ignore TS6133
function convertCfnClusterPropsToCloudFormation(properties: any): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnClusterPropsValidator(properties).assertSuccess();
  return {
    Capacity: convertCfnClusterCapacityPropertyToCloudFormation(
      properties.capacity
    ),
    ClusterName: cdk.stringToCloudFormation(properties.clusterName),
    Customizations: convertCfnClusterCustomizationsPropertyToCloudFormation(
      properties.customizations
    ),
    Logging: cdk.unionMapper(
      [
        CfnClusterCombinedLoggingPropertyValidator,
        CfnClusterIndividualLoggingPropertyValidator,
        CfnClusterDisabledLoggingPropertyValidator,
      ],
      [
        convertCfnClusterCombinedLoggingPropertyToCloudFormation,
        convertCfnClusterIndividualLoggingPropertyToCloudFormation,
        convertCfnClusterDisabledLoggingPropertyToCloudFormation,
      ]
    )(properties.logging),
    Networking: convertCfnClusterNetworkingPropertyToCloudFormation(
      properties.networking
    ),
    Security: convertCfnClusterSecurityPropertyToCloudFormation(
      properties.security
    ),
    Snapshots: cdk.unionMapper(
      [
        CfnClusterEnabledSnapshotsPropertyValidator,
        CfnClusterDisabledSnapshotsPropertyValidator,
      ],
      [
        convertCfnClusterEnabledSnapshotsPropertyToCloudFormation,
        convertCfnClusterDisabledSnapshotsPropertyToCloudFormation,
      ]
    )(properties.snapshots),
    Tags: cdk.listMapper(cdk.cfnTagToCloudFormation)(properties.tags),
    Topology: convertCfnClusterTopologyPropertyToCloudFormation(
      properties.topology
    ),
  };
}

// @ts-ignore TS6133
function CfnClusterPropsFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<CfnClusterProps | cdk.IResolvable> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret = new cfn_parse.FromCloudFormationPropertyObject<CfnClusterProps>();
  ret.addPropertyResult(
    "capacity",
    "Capacity",
    properties.Capacity != null
      ? CfnClusterCapacityPropertyFromCloudFormation(properties.Capacity)
      : undefined
  );
  ret.addPropertyResult(
    "clusterName",
    "ClusterName",
    properties.ClusterName != null
      ? cfn_parse.FromCloudFormation.getString(properties.ClusterName)
      : undefined
  );
  ret.addPropertyResult(
    "customizations",
    "Customizations",
    properties.Customizations != null
      ? CfnClusterCustomizationsPropertyFromCloudFormation(
          properties.Customizations
        )
      : undefined
  );
  ret.addPropertyResult(
    "logging",
    "Logging",
    properties.Logging != null
      ? cfn_parse.FromCloudFormation.getTypeUnion(
          [
            CfnClusterCombinedLoggingPropertyValidator,
            CfnClusterIndividualLoggingPropertyValidator,
            CfnClusterDisabledLoggingPropertyValidator,
          ],
          [
            CfnClusterCombinedLoggingPropertyFromCloudFormation,
            CfnClusterIndividualLoggingPropertyFromCloudFormation,
            CfnClusterDisabledLoggingPropertyFromCloudFormation,
          ]
        )(properties.Logging)
      : undefined
  );
  ret.addPropertyResult(
    "networking",
    "Networking",
    properties.Networking != null
      ? CfnClusterNetworkingPropertyFromCloudFormation(properties.Networking)
      : undefined
  );
  ret.addPropertyResult(
    "security",
    "Security",
    properties.Security != null
      ? CfnClusterSecurityPropertyFromCloudFormation(properties.Security)
      : undefined
  );
  ret.addPropertyResult(
    "snapshots",
    "Snapshots",
    properties.Snapshots != null
      ? cfn_parse.FromCloudFormation.getTypeUnion(
          [
            CfnClusterEnabledSnapshotsPropertyValidator,
            CfnClusterDisabledSnapshotsPropertyValidator,
          ],
          [
            CfnClusterEnabledSnapshotsPropertyFromCloudFormation,
            CfnClusterDisabledSnapshotsPropertyFromCloudFormation,
          ]
        )(properties.Snapshots)
      : undefined
  );
  ret.addPropertyResult(
    "tags",
    "Tags",
    properties.Tags != null
      ? cfn_parse.FromCloudFormation.getArray(
          cfn_parse.FromCloudFormation.getCfnTag
        )(properties.Tags)
      : undefined
  );
  ret.addPropertyResult(
    "topology",
    "Topology",
    properties.Topology != null
      ? CfnClusterTopologyPropertyFromCloudFormation(properties.Topology)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * An example resource schema demonstrating some basic constructs and validation rules.
 *
 * @cloudformationResource HitchPin::AutoOs::RootCA
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html
 */
export class CfnRootCA extends cdk.CfnResource implements cdk.IInspectable {
  /**
   * The CloudFormation resource type name for this resource class.
   */
  public static readonly CFN_RESOURCE_TYPE_NAME: string =
    "HitchPin::AutoOs::RootCA";

  /**
   * Build a CfnRootCA from CloudFormation properties
   *
   * A factory method that creates a new instance of this class from an object
   * containing the CloudFormation properties of this resource.
   * Used in the @aws-cdk/cloudformation-include module.
   *
   * @internal
   */
  public static _fromCloudFormation(
    scope: constructs.Construct,
    id: string,
    resourceAttributes: any,
    options: cfn_parse.FromCloudFormationOptions
  ): CfnRootCA {
    resourceAttributes = resourceAttributes || {};
    const resourceProperties = options.parser.parseValue(
      resourceAttributes.Properties
    );
    const propsResult = CfnRootCAPropsFromCloudFormation(resourceProperties);
    if (cdk.isResolvableObject(propsResult.value)) {
      throw new Error("Unexpected IResolvable");
    }
    const ret = new CfnRootCA(scope, id, propsResult.value);
    for (const [propKey, propVal] of Object.entries(
      propsResult.extraProperties
    )) {
      ret.addPropertyOverride(propKey, propVal);
    }
    options.parser.handleAttributes(ret, resourceAttributes, id);
    return ret;
  }

  /**
   * @cloudformationAttribute PrivateKeySecretArn
   */
  public readonly attrPrivateKeySecretArn: string;

  /**
   * @cloudformationAttribute PublicCertificatePem
   */
  public readonly attrPublicCertificatePem: string;

  /**
   * @cloudformationAttribute Serial
   */
  public readonly attrSerial: string;

  public expirationDays?: number;

  public keySize?: number;

  public privateKeyKmsKeyId: string;

  public privateKeySecretName: string;

  /**
   * The subject of the CA.
   */
  public subject: cdk.IResolvable | CfnRootCA.SubjectProperty;

  /**
   * @param scope Scope in which this resource is defined
   * @param id Construct identifier for this resource (unique in its scope)
   * @param props Resource properties
   */
  public constructor(
    scope: constructs.Construct,
    id: string,
    props: CfnRootCAProps
  ) {
    super(scope, id, {
      type: CfnRootCA.CFN_RESOURCE_TYPE_NAME,
      properties: props,
    });

    cdk.requireProperty(props, "privateKeyKmsKeyId", this);
    cdk.requireProperty(props, "privateKeySecretName", this);
    cdk.requireProperty(props, "subject", this);

    this.attrPrivateKeySecretArn = cdk.Token.asString(
      this.getAtt("PrivateKeySecretArn", cdk.ResolutionTypeHint.STRING)
    );
    this.attrPublicCertificatePem = cdk.Token.asString(
      this.getAtt("PublicCertificatePem", cdk.ResolutionTypeHint.STRING)
    );
    this.attrSerial = cdk.Token.asString(
      this.getAtt("Serial", cdk.ResolutionTypeHint.STRING)
    );
    this.expirationDays = props.expirationDays;
    this.keySize = props.keySize;
    this.privateKeyKmsKeyId = props.privateKeyKmsKeyId;
    this.privateKeySecretName = props.privateKeySecretName;
    this.subject = props.subject;
  }

  protected get cfnProperties(): Record<string, any> {
    return {
      expirationDays: this.expirationDays,
      keySize: this.keySize,
      privateKeyKmsKeyId: this.privateKeyKmsKeyId,
      privateKeySecretName: this.privateKeySecretName,
      subject: this.subject,
    };
  }

  /**
   * Examines the CloudFormation resource and discloses attributes
   *
   * @param inspector tree inspector to collect and process attributes
   */
  public inspect(inspector: cdk.TreeInspector): void {
    inspector.addAttribute(
      "aws:cdk:cloudformation:type",
      CfnRootCA.CFN_RESOURCE_TYPE_NAME
    );
    inspector.addAttribute("aws:cdk:cloudformation:props", this.cfnProperties);
  }

  protected renderProperties(props: Record<string, any>): Record<string, any> {
    return convertCfnRootCAPropsToCloudFormation(props);
  }
}

export namespace CfnRootCA {
  /**
   * The subject of the CA.
   *
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html
   */
  export interface SubjectProperty {
    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html#cfn-autoos-rootca-subject-city
     */
    readonly city: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html#cfn-autoos-rootca-subject-commonname
     */
    readonly commonName: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html#cfn-autoos-rootca-subject-country
     */
    readonly country: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html#cfn-autoos-rootca-subject-organization
     */
    readonly organization: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html#cfn-autoos-rootca-subject-organizationalunit
     */
    readonly organizationalUnit?: string;

    /**
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-rootca-subject.html#cfn-autoos-rootca-subject-state
     */
    readonly state?: string;
  }
}

/**
 * Properties for defining a `CfnRootCA`
 *
 * @struct
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html
 */
export interface CfnRootCAProps {
  /**
   * @default - 3650
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html#cfn-autoos-rootca-expirationdays
   */
  readonly expirationDays?: number;

  /**
   * @default - 2048
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html#cfn-autoos-rootca-keysize
   */
  readonly keySize?: number;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html#cfn-autoos-rootca-privatekeykmskeyid
   */
  readonly privateKeyKmsKeyId: string;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html#cfn-autoos-rootca-privatekeysecretname
   */
  readonly privateKeySecretName: string;

  /**
   * The subject of the CA.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html#cfn-autoos-rootca-subject
   */
  readonly subject: cdk.IResolvable | CfnRootCA.SubjectProperty;
}

/**
 * Determine whether the given properties match those of a `SubjectProperty`
 *
 * @param properties - the TypeScript properties of a `SubjectProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnRootCASubjectPropertyValidator(
  properties: any
): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator("city", cdk.requiredValidator)(properties.city)
  );
  errors.collect(
    cdk.propertyValidator("city", cdk.validateString)(properties.city)
  );
  errors.collect(
    cdk.propertyValidator(
      "commonName",
      cdk.requiredValidator
    )(properties.commonName)
  );
  errors.collect(
    cdk.propertyValidator(
      "commonName",
      cdk.validateString
    )(properties.commonName)
  );
  errors.collect(
    cdk.propertyValidator("country", cdk.requiredValidator)(properties.country)
  );
  errors.collect(
    cdk.propertyValidator("country", cdk.validateString)(properties.country)
  );
  errors.collect(
    cdk.propertyValidator(
      "organization",
      cdk.requiredValidator
    )(properties.organization)
  );
  errors.collect(
    cdk.propertyValidator(
      "organization",
      cdk.validateString
    )(properties.organization)
  );
  errors.collect(
    cdk.propertyValidator(
      "organizationalUnit",
      cdk.validateString
    )(properties.organizationalUnit)
  );
  errors.collect(
    cdk.propertyValidator("state", cdk.validateString)(properties.state)
  );
  return errors.wrap('supplied properties not correct for "SubjectProperty"');
}

// @ts-ignore TS6133
function convertCfnRootCASubjectPropertyToCloudFormation(properties: any): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnRootCASubjectPropertyValidator(properties).assertSuccess();
  return {
    City: cdk.stringToCloudFormation(properties.city),
    CommonName: cdk.stringToCloudFormation(properties.commonName),
    Country: cdk.stringToCloudFormation(properties.country),
    Organization: cdk.stringToCloudFormation(properties.organization),
    OrganizationalUnit: cdk.stringToCloudFormation(
      properties.organizationalUnit
    ),
    State: cdk.stringToCloudFormation(properties.state),
  };
}

// @ts-ignore TS6133
function CfnRootCASubjectPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  cdk.IResolvable | CfnRootCA.SubjectProperty
> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret =
    new cfn_parse.FromCloudFormationPropertyObject<CfnRootCA.SubjectProperty>();
  ret.addPropertyResult(
    "city",
    "City",
    properties.City != null
      ? cfn_parse.FromCloudFormation.getString(properties.City)
      : undefined
  );
  ret.addPropertyResult(
    "commonName",
    "CommonName",
    properties.CommonName != null
      ? cfn_parse.FromCloudFormation.getString(properties.CommonName)
      : undefined
  );
  ret.addPropertyResult(
    "country",
    "Country",
    properties.Country != null
      ? cfn_parse.FromCloudFormation.getString(properties.Country)
      : undefined
  );
  ret.addPropertyResult(
    "organization",
    "Organization",
    properties.Organization != null
      ? cfn_parse.FromCloudFormation.getString(properties.Organization)
      : undefined
  );
  ret.addPropertyResult(
    "organizationalUnit",
    "OrganizationalUnit",
    properties.OrganizationalUnit != null
      ? cfn_parse.FromCloudFormation.getString(properties.OrganizationalUnit)
      : undefined
  );
  ret.addPropertyResult(
    "state",
    "State",
    properties.State != null
      ? cfn_parse.FromCloudFormation.getString(properties.State)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `CfnRootCAProps`
 *
 * @param properties - the TypeScript properties of a `CfnRootCAProps`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnRootCAPropsValidator(properties: any): cdk.ValidationResult {
  if (!cdk.canInspect(properties)) return cdk.VALIDATION_SUCCESS;
  const errors = new cdk.ValidationResults();
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    errors.collect(
      new cdk.ValidationResult(
        "Expected an object, but received: " + JSON.stringify(properties)
      )
    );
  }
  errors.collect(
    cdk.propertyValidator(
      "expirationDays",
      cdk.validateNumber
    )(properties.expirationDays)
  );
  errors.collect(
    cdk.propertyValidator("keySize", cdk.validateNumber)(properties.keySize)
  );
  errors.collect(
    cdk.propertyValidator(
      "privateKeyKmsKeyId",
      cdk.requiredValidator
    )(properties.privateKeyKmsKeyId)
  );
  errors.collect(
    cdk.propertyValidator(
      "privateKeyKmsKeyId",
      cdk.validateString
    )(properties.privateKeyKmsKeyId)
  );
  errors.collect(
    cdk.propertyValidator(
      "privateKeySecretName",
      cdk.requiredValidator
    )(properties.privateKeySecretName)
  );
  errors.collect(
    cdk.propertyValidator(
      "privateKeySecretName",
      cdk.validateString
    )(properties.privateKeySecretName)
  );
  errors.collect(
    cdk.propertyValidator("subject", cdk.requiredValidator)(properties.subject)
  );
  errors.collect(
    cdk.propertyValidator(
      "subject",
      CfnRootCASubjectPropertyValidator
    )(properties.subject)
  );
  return errors.wrap('supplied properties not correct for "CfnRootCAProps"');
}

// @ts-ignore TS6133
function convertCfnRootCAPropsToCloudFormation(properties: any): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnRootCAPropsValidator(properties).assertSuccess();
  return {
    ExpirationDays: cdk.numberToCloudFormation(properties.expirationDays),
    KeySize: cdk.numberToCloudFormation(properties.keySize),
    PrivateKeyKmsKeyId: cdk.stringToCloudFormation(
      properties.privateKeyKmsKeyId
    ),
    PrivateKeySecretName: cdk.stringToCloudFormation(
      properties.privateKeySecretName
    ),
    Subject: convertCfnRootCASubjectPropertyToCloudFormation(
      properties.subject
    ),
  };
}

// @ts-ignore TS6133
function CfnRootCAPropsFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<CfnRootCAProps | cdk.IResolvable> {
  if (cdk.isResolvableObject(properties)) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  properties = properties == null ? {} : properties;
  if (
    !(properties && typeof properties == "object" && !Array.isArray(properties))
  ) {
    return new cfn_parse.FromCloudFormationResult(properties);
  }
  const ret = new cfn_parse.FromCloudFormationPropertyObject<CfnRootCAProps>();
  ret.addPropertyResult(
    "expirationDays",
    "ExpirationDays",
    properties.ExpirationDays != null
      ? cfn_parse.FromCloudFormation.getNumber(properties.ExpirationDays)
      : undefined
  );
  ret.addPropertyResult(
    "keySize",
    "KeySize",
    properties.KeySize != null
      ? cfn_parse.FromCloudFormation.getNumber(properties.KeySize)
      : undefined
  );
  ret.addPropertyResult(
    "privateKeyKmsKeyId",
    "PrivateKeyKmsKeyId",
    properties.PrivateKeyKmsKeyId != null
      ? cfn_parse.FromCloudFormation.getString(properties.PrivateKeyKmsKeyId)
      : undefined
  );
  ret.addPropertyResult(
    "privateKeySecretName",
    "PrivateKeySecretName",
    properties.PrivateKeySecretName != null
      ? cfn_parse.FromCloudFormation.getString(properties.PrivateKeySecretName)
      : undefined
  );
  ret.addPropertyResult(
    "subject",
    "Subject",
    properties.Subject != null
      ? CfnRootCASubjectPropertyFromCloudFormation(properties.Subject)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}
