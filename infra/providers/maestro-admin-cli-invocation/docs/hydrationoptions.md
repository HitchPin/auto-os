# HitchPin::AutoOs::MaestroAdminCliInvocation HydrationOptions

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#substrateparamname" title="SubstrateParamName">SubstrateParamName</a>" : <i>String</i>,
    "<a href="#controlplaneparamname" title="ControlPlaneParamName">ControlPlaneParamName</a>" : <i>String</i>,
    "<a href="#dataplaneparamname" title="DataPlaneParamName">DataPlaneParamName</a>" : <i>String</i>
}
</pre>

### YAML

<pre>
<a href="#substrateparamname" title="SubstrateParamName">SubstrateParamName</a>: <i>String</i>
<a href="#controlplaneparamname" title="ControlPlaneParamName">ControlPlaneParamName</a>: <i>String</i>
<a href="#dataplaneparamname" title="DataPlaneParamName">DataPlaneParamName</a>: <i>String</i>
</pre>

## Properties

#### SubstrateParamName

SSM param name containing all required values for substrate stack hydration.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ControlPlaneParamName

SSM param name containing all required values for control plane stack hydration.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### DataPlaneParamName

SSM param name containing all required values for control plane stack hydration.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

