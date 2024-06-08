/* eslint-disable prettier/prettier,max-len */
import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as cfn_parse from "aws-cdk-lib/core/lib/helpers-internal";

/**
 * An example resource schema demonstrating some basic constructs and validation rules.
 *
 * @cloudformationResource HitchPin::AutoOs::LbCertificate
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html
 */
export class CfnLbCertificate
  extends cdk.CfnResource
  implements cdk.IInspectable, cdk.ITaggableV2
{
  /**
   * The CloudFormation resource type name for this resource class.
   */
  public static readonly CFN_RESOURCE_TYPE_NAME: string =
    "HitchPin::AutoOs::LbCertificate";

  /**
   * Build a CfnLbCertificate from CloudFormation properties
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
  ): CfnLbCertificate {
    resourceAttributes = resourceAttributes || {};
    const resourceProperties = options.parser.parseValue(
      resourceAttributes.Properties
    );
    const propsResult =
      CfnLbCertificatePropsFromCloudFormation(resourceProperties);
    if (cdk.isResolvableObject(propsResult.value)) {
      throw new Error("Unexpected IResolvable");
    }
    const ret = new CfnLbCertificate(scope, id, propsResult.value);
    for (const [propKey, propVal] of Object.entries(
      propsResult.extraProperties
    )) {
      ret.addPropertyOverride(propKey, propVal);
    }
    options.parser.handleAttributes(ret, resourceAttributes, id);
    return ret;
  }

  /**
   * @cloudformationAttribute AcmCertificateId
   */
  public readonly attrAcmCertificateId: string;

  /**
   * Tag Manager which manages the tags for this resource
   */
  public readonly cdkTagManager: cdk.TagManager;

  /**
   * The common name of the cert.
   */
  public commonName: string;

  public expirationDays?: number;

  public keySize?: number;

  /**
   * The secret id of the root CA certificate.
   */
  public rootCaSecretId: string;

  /**
   * An array of key-value pairs to apply to this resource.
   */
  public tags?: Array<cdk.CfnTag>;

  /**
   * @param scope Scope in which this resource is defined
   * @param id Construct identifier for this resource (unique in its scope)
   * @param props Resource properties
   */
  public constructor(
    scope: constructs.Construct,
    id: string,
    props: CfnLbCertificateProps
  ) {
    super(scope, id, {
      type: CfnLbCertificate.CFN_RESOURCE_TYPE_NAME,
      properties: props,
    });

    cdk.requireProperty(props, "commonName", this);
    cdk.requireProperty(props, "rootCaSecretId", this);

    this.attrAcmCertificateId = cdk.Token.asString(
      this.getAtt("AcmCertificateId", cdk.ResolutionTypeHint.STRING)
    );
    this.cdkTagManager = new cdk.TagManager(
      cdk.TagType.STANDARD,
      "HitchPin::AutoOs::LbCertificate",
      undefined,
      {
        tagPropertyName: "tags",
      }
    );
    this.commonName = props.commonName;
    this.expirationDays = props.expirationDays;
    this.keySize = props.keySize;
    this.rootCaSecretId = props.rootCaSecretId;
    this.tags = props.tags;
  }

  protected get cfnProperties(): Record<string, any> {
    return {
      tags: this.cdkTagManager.renderTags(this.tags),
      commonName: this.commonName,
      expirationDays: this.expirationDays,
      keySize: this.keySize,
      rootCaSecretId: this.rootCaSecretId,
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
      CfnLbCertificate.CFN_RESOURCE_TYPE_NAME
    );
    inspector.addAttribute("aws:cdk:cloudformation:props", this.cfnProperties);
  }

  protected renderProperties(props: Record<string, any>): Record<string, any> {
    return convertCfnLbCertificatePropsToCloudFormation(props);
  }
}

/**
 * Properties for defining a `CfnLbCertificate`
 *
 * @struct
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html
 */
export interface CfnLbCertificateProps {
  /**
   * The common name of the cert.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html#cfn-autoos-lbcertificate-commonname
   */
  readonly commonName: string;

  /**
   * @default - 730
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html#cfn-autoos-lbcertificate-expirationdays
   */
  readonly expirationDays?: number;

  /**
   * @default - 2048
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html#cfn-autoos-lbcertificate-keysize
   */
  readonly keySize?: number;

  /**
   * The secret id of the root CA certificate.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html#cfn-autoos-lbcertificate-rootcasecretid
   */
  readonly rootCaSecretId: string;

  /**
   * An array of key-value pairs to apply to this resource.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-lbcertificate.html#cfn-autoos-lbcertificate-tags
   */
  readonly tags?: Array<cdk.CfnTag>;
}

/**
 * Determine whether the given properties match those of a `CfnLbCertificateProps`
 *
 * @param properties - the TypeScript properties of a `CfnLbCertificateProps`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnLbCertificatePropsValidator(properties: any): cdk.ValidationResult {
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
      "rootCaSecretId",
      cdk.requiredValidator
    )(properties.rootCaSecretId)
  );
  errors.collect(
    cdk.propertyValidator(
      "rootCaSecretId",
      cdk.validateString
    )(properties.rootCaSecretId)
  );
  errors.collect(
    cdk.propertyValidator(
      "tags",
      cdk.listValidator(cdk.validateCfnTag)
    )(properties.tags)
  );
  return errors.wrap(
    'supplied properties not correct for "CfnLbCertificateProps"'
  );
}

// @ts-ignore TS6133
function convertCfnLbCertificatePropsToCloudFormation(properties: any): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnLbCertificatePropsValidator(properties).assertSuccess();
  return {
    CommonName: cdk.stringToCloudFormation(properties.commonName),
    ExpirationDays: cdk.numberToCloudFormation(properties.expirationDays),
    KeySize: cdk.numberToCloudFormation(properties.keySize),
    RootCASecretId: cdk.stringToCloudFormation(properties.rootCaSecretId),
    Tags: cdk.listMapper(cdk.cfnTagToCloudFormation)(properties.tags),
  };
}

// @ts-ignore TS6133
function CfnLbCertificatePropsFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<CfnLbCertificateProps | cdk.IResolvable> {
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
    new cfn_parse.FromCloudFormationPropertyObject<CfnLbCertificateProps>();
  ret.addPropertyResult(
    "commonName",
    "CommonName",
    properties.CommonName != null
      ? cfn_parse.FromCloudFormation.getString(properties.CommonName)
      : undefined
  );
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
    "rootCaSecretId",
    "RootCASecretId",
    properties.RootCASecretId != null
      ? cfn_parse.FromCloudFormation.getString(properties.RootCASecretId)
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
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * An example resource schema demonstrating some basic constructs and validation rules.
 *
 * @cloudformationResource HitchPin::AutoOs::MaestroAdminCliInvocation
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-maestroadmincliinvocation.html
 */
export class CfnMaestroAdminCliInvocation
  extends cdk.CfnResource
  implements cdk.IInspectable
{
  /**
   * The CloudFormation resource type name for this resource class.
   */
  public static readonly CFN_RESOURCE_TYPE_NAME: string =
    "HitchPin::AutoOs::MaestroAdminCliInvocation";

  /**
   * Build a CfnMaestroAdminCliInvocation from CloudFormation properties
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
  ): CfnMaestroAdminCliInvocation {
    resourceAttributes = resourceAttributes || {};
    const resourceProperties = options.parser.parseValue(
      resourceAttributes.Properties
    );
    const propsResult =
      CfnMaestroAdminCliInvocationPropsFromCloudFormation(resourceProperties);
    if (cdk.isResolvableObject(propsResult.value)) {
      throw new Error("Unexpected IResolvable");
    }
    const ret = new CfnMaestroAdminCliInvocation(scope, id, propsResult.value);
    for (const [propKey, propVal] of Object.entries(
      propsResult.extraProperties
    )) {
      ret.addPropertyOverride(propKey, propVal);
    }
    options.parser.handleAttributes(ret, resourceAttributes, id);
    return ret;
  }

  /**
   * @cloudformationAttribute CommandOutput
   */
  public readonly attrCommandOutput: string;

  /**
   * @cloudformationAttribute InvocationId
   */
  public readonly attrInvocationId: string;

  /**
   * A Maestro CLI command (without the ./maestro-admin part).
   */
  public cliCommand: string;

  public hydration:
    | CfnMaestroAdminCliInvocation.HydrationOptionsProperty
    | cdk.IResolvable;

  /**
   * CodeBuild project name.
   */
  public projectName: string;

  /**
   * IAM role with permissions to execute the given Admin CLI command.
   */
  public roleArn: string;

  /**
   * @param scope Scope in which this resource is defined
   * @param id Construct identifier for this resource (unique in its scope)
   * @param props Resource properties
   */
  public constructor(
    scope: constructs.Construct,
    id: string,
    props: CfnMaestroAdminCliInvocationProps
  ) {
    super(scope, id, {
      type: CfnMaestroAdminCliInvocation.CFN_RESOURCE_TYPE_NAME,
      properties: props,
    });

    cdk.requireProperty(props, "cliCommand", this);
    cdk.requireProperty(props, "hydration", this);
    cdk.requireProperty(props, "projectName", this);
    cdk.requireProperty(props, "roleArn", this);

    this.attrCommandOutput = cdk.Token.asString(
      this.getAtt("CommandOutput", cdk.ResolutionTypeHint.STRING)
    );
    this.attrInvocationId = cdk.Token.asString(
      this.getAtt("InvocationId", cdk.ResolutionTypeHint.STRING)
    );
    this.cliCommand = props.cliCommand;
    this.hydration = props.hydration;
    this.projectName = props.projectName;
    this.roleArn = props.roleArn;
  }

  protected get cfnProperties(): Record<string, any> {
    return {
      cliCommand: this.cliCommand,
      hydration: this.hydration,
      projectName: this.projectName,
      roleArn: this.roleArn,
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
      CfnMaestroAdminCliInvocation.CFN_RESOURCE_TYPE_NAME
    );
    inspector.addAttribute("aws:cdk:cloudformation:props", this.cfnProperties);
  }

  protected renderProperties(props: Record<string, any>): Record<string, any> {
    return convertCfnMaestroAdminCliInvocationPropsToCloudFormation(props);
  }
}

export namespace CfnMaestroAdminCliInvocation {
  /**
   * @struct
   * @stability external
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-maestroadmincliinvocation-hydrationoptions.html
   */
  export interface HydrationOptionsProperty {
    /**
     * SSM param name containing all required values for control plane stack hydration.
     *
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-maestroadmincliinvocation-hydrationoptions.html#cfn-autoos-maestroadmincliinvocation-hydrationoptions-controlplaneparamname
     */
    readonly controlPlaneParamName: string;

    /**
     * SSM param name containing all required values for control plane stack hydration.
     *
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-maestroadmincliinvocation-hydrationoptions.html#cfn-autoos-maestroadmincliinvocation-hydrationoptions-dataplaneparamname
     */
    readonly dataPlaneParamName: string;

    /**
     * SSM param name containing all required values for substrate stack hydration.
     *
     * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-autoos-maestroadmincliinvocation-hydrationoptions.html#cfn-autoos-maestroadmincliinvocation-hydrationoptions-substrateparamname
     */
    readonly substrateParamName: string;
  }
}

/**
 * Properties for defining a `CfnMaestroAdminCliInvocation`
 *
 * @struct
 * @stability external
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-maestroadmincliinvocation.html
 */
export interface CfnMaestroAdminCliInvocationProps {
  /**
   * A Maestro CLI command (without the ./maestro-admin part).
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-maestroadmincliinvocation.html#cfn-autoos-maestroadmincliinvocation-clicommand
   */
  readonly cliCommand: string;

  /**
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-maestroadmincliinvocation.html#cfn-autoos-maestroadmincliinvocation-hydration
   */
  readonly hydration:
    | CfnMaestroAdminCliInvocation.HydrationOptionsProperty
    | cdk.IResolvable;

  /**
   * CodeBuild project name.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-maestroadmincliinvocation.html#cfn-autoos-maestroadmincliinvocation-projectname
   */
  readonly projectName: string;

  /**
   * IAM role with permissions to execute the given Admin CLI command.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-maestroadmincliinvocation.html#cfn-autoos-maestroadmincliinvocation-rolearn
   */
  readonly roleArn: string;
}

/**
 * Determine whether the given properties match those of a `HydrationOptionsProperty`
 *
 * @param properties - the TypeScript properties of a `HydrationOptionsProperty`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnMaestroAdminCliInvocationHydrationOptionsPropertyValidator(
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
      "controlPlaneParamName",
      cdk.requiredValidator
    )(properties.controlPlaneParamName)
  );
  errors.collect(
    cdk.propertyValidator(
      "controlPlaneParamName",
      cdk.validateString
    )(properties.controlPlaneParamName)
  );
  errors.collect(
    cdk.propertyValidator(
      "dataPlaneParamName",
      cdk.requiredValidator
    )(properties.dataPlaneParamName)
  );
  errors.collect(
    cdk.propertyValidator(
      "dataPlaneParamName",
      cdk.validateString
    )(properties.dataPlaneParamName)
  );
  errors.collect(
    cdk.propertyValidator(
      "substrateParamName",
      cdk.requiredValidator
    )(properties.substrateParamName)
  );
  errors.collect(
    cdk.propertyValidator(
      "substrateParamName",
      cdk.validateString
    )(properties.substrateParamName)
  );
  return errors.wrap(
    'supplied properties not correct for "HydrationOptionsProperty"'
  );
}

// @ts-ignore TS6133
function convertCfnMaestroAdminCliInvocationHydrationOptionsPropertyToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnMaestroAdminCliInvocationHydrationOptionsPropertyValidator(
    properties
  ).assertSuccess();
  return {
    ControlPlaneParamName: cdk.stringToCloudFormation(
      properties.controlPlaneParamName
    ),
    DataPlaneParamName: cdk.stringToCloudFormation(
      properties.dataPlaneParamName
    ),
    SubstrateParamName: cdk.stringToCloudFormation(
      properties.substrateParamName
    ),
  };
}

// @ts-ignore TS6133
function CfnMaestroAdminCliInvocationHydrationOptionsPropertyFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnMaestroAdminCliInvocation.HydrationOptionsProperty | cdk.IResolvable
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
    new cfn_parse.FromCloudFormationPropertyObject<CfnMaestroAdminCliInvocation.HydrationOptionsProperty>();
  ret.addPropertyResult(
    "controlPlaneParamName",
    "ControlPlaneParamName",
    properties.ControlPlaneParamName != null
      ? cfn_parse.FromCloudFormation.getString(properties.ControlPlaneParamName)
      : undefined
  );
  ret.addPropertyResult(
    "dataPlaneParamName",
    "DataPlaneParamName",
    properties.DataPlaneParamName != null
      ? cfn_parse.FromCloudFormation.getString(properties.DataPlaneParamName)
      : undefined
  );
  ret.addPropertyResult(
    "substrateParamName",
    "SubstrateParamName",
    properties.SubstrateParamName != null
      ? cfn_parse.FromCloudFormation.getString(properties.SubstrateParamName)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}

/**
 * Determine whether the given properties match those of a `CfnMaestroAdminCliInvocationProps`
 *
 * @param properties - the TypeScript properties of a `CfnMaestroAdminCliInvocationProps`
 *
 * @returns the result of the validation.
 */
// @ts-ignore TS6133
function CfnMaestroAdminCliInvocationPropsValidator(
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
      "cliCommand",
      cdk.requiredValidator
    )(properties.cliCommand)
  );
  errors.collect(
    cdk.propertyValidator(
      "cliCommand",
      cdk.validateString
    )(properties.cliCommand)
  );
  errors.collect(
    cdk.propertyValidator(
      "hydration",
      cdk.requiredValidator
    )(properties.hydration)
  );
  errors.collect(
    cdk.propertyValidator(
      "hydration",
      CfnMaestroAdminCliInvocationHydrationOptionsPropertyValidator
    )(properties.hydration)
  );
  errors.collect(
    cdk.propertyValidator(
      "projectName",
      cdk.requiredValidator
    )(properties.projectName)
  );
  errors.collect(
    cdk.propertyValidator(
      "projectName",
      cdk.validateString
    )(properties.projectName)
  );
  errors.collect(
    cdk.propertyValidator("roleArn", cdk.requiredValidator)(properties.roleArn)
  );
  errors.collect(
    cdk.propertyValidator("roleArn", cdk.validateString)(properties.roleArn)
  );
  return errors.wrap(
    'supplied properties not correct for "CfnMaestroAdminCliInvocationProps"'
  );
}

// @ts-ignore TS6133
function convertCfnMaestroAdminCliInvocationPropsToCloudFormation(
  properties: any
): any {
  if (!cdk.canInspect(properties)) return properties;
  CfnMaestroAdminCliInvocationPropsValidator(properties).assertSuccess();
  return {
    CliCommand: cdk.stringToCloudFormation(properties.cliCommand),
    Hydration:
      convertCfnMaestroAdminCliInvocationHydrationOptionsPropertyToCloudFormation(
        properties.hydration
      ),
    ProjectName: cdk.stringToCloudFormation(properties.projectName),
    RoleArn: cdk.stringToCloudFormation(properties.roleArn),
  };
}

// @ts-ignore TS6133
function CfnMaestroAdminCliInvocationPropsFromCloudFormation(
  properties: any
): cfn_parse.FromCloudFormationResult<
  CfnMaestroAdminCliInvocationProps | cdk.IResolvable
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
    new cfn_parse.FromCloudFormationPropertyObject<CfnMaestroAdminCliInvocationProps>();
  ret.addPropertyResult(
    "cliCommand",
    "CliCommand",
    properties.CliCommand != null
      ? cfn_parse.FromCloudFormation.getString(properties.CliCommand)
      : undefined
  );
  ret.addPropertyResult(
    "hydration",
    "Hydration",
    properties.Hydration != null
      ? CfnMaestroAdminCliInvocationHydrationOptionsPropertyFromCloudFormation(
          properties.Hydration
        )
      : undefined
  );
  ret.addPropertyResult(
    "projectName",
    "ProjectName",
    properties.ProjectName != null
      ? cfn_parse.FromCloudFormation.getString(properties.ProjectName)
      : undefined
  );
  ret.addPropertyResult(
    "roleArn",
    "RoleArn",
    properties.RoleArn != null
      ? cfn_parse.FromCloudFormation.getString(properties.RoleArn)
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
export class CfnRootCA
  extends cdk.CfnResource
  implements cdk.IInspectable, cdk.ITaggableV2
{
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

  /**
   * Tag Manager which manages the tags for this resource
   */
  public readonly cdkTagManager: cdk.TagManager;

  public expirationDays?: number;

  public keySize?: number;

  public privateKeyKmsKeyId: string;

  public privateKeySecretName: string;

  /**
   * The subject of the CA.
   */
  public subject: cdk.IResolvable | CfnRootCA.SubjectProperty;

  /**
   * An array of key-value pairs to apply to this resource.
   */
  public tags?: Array<cdk.CfnTag>;

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
    this.cdkTagManager = new cdk.TagManager(
      cdk.TagType.STANDARD,
      "HitchPin::AutoOs::RootCA",
      undefined,
      {
        tagPropertyName: "tags",
      }
    );
    this.expirationDays = props.expirationDays;
    this.keySize = props.keySize;
    this.privateKeyKmsKeyId = props.privateKeyKmsKeyId;
    this.privateKeySecretName = props.privateKeySecretName;
    this.subject = props.subject;
    this.tags = props.tags;
  }

  protected get cfnProperties(): Record<string, any> {
    return {
      tags: this.cdkTagManager.renderTags(this.tags),
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

  /**
   * An array of key-value pairs to apply to this resource.
   *
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoos-rootca.html#cfn-autoos-rootca-tags
   */
  readonly tags?: Array<cdk.CfnTag>;
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
  errors.collect(
    cdk.propertyValidator(
      "tags",
      cdk.listValidator(cdk.validateCfnTag)
    )(properties.tags)
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
    Tags: cdk.listMapper(cdk.cfnTagToCloudFormation)(properties.tags),
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
  ret.addPropertyResult(
    "tags",
    "Tags",
    properties.Tags != null
      ? cfn_parse.FromCloudFormation.getArray(
          cfn_parse.FromCloudFormation.getCfnTag
        )(properties.Tags)
      : undefined
  );
  ret.addUnrecognizedPropertiesAsExtra(properties);
  return ret;
}
