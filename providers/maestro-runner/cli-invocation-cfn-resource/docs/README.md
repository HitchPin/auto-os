# HitchPin::AutoOs::MaestroAdminCliInvocation

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "HitchPin::AutoOs::MaestroAdminCliInvocation",
    "Properties" : {
        "<a href="#projectname" title="ProjectName">ProjectName</a>" : <i>String</i>,
        "<a href="#clicommand" title="CliCommand">CliCommand</a>" : <i>String</i>,
        "<a href="#rolearn" title="RoleArn">RoleArn</a>" : <i>String</i>,
        "<a href="#hydration" title="Hydration">Hydration</a>" : <i><a href="hydrationoptions.md">HydrationOptions</a></i>,
    }
}
</pre>

### YAML

<pre>
Type: HitchPin::AutoOs::MaestroAdminCliInvocation
Properties:
    <a href="#projectname" title="ProjectName">ProjectName</a>: <i>String</i>
    <a href="#clicommand" title="CliCommand">CliCommand</a>: <i>String</i>
    <a href="#rolearn" title="RoleArn">RoleArn</a>: <i>String</i>
    <a href="#hydration" title="Hydration">Hydration</a>: <i><a href="hydrationoptions.md">HydrationOptions</a></i>
</pre>

## Properties

#### ProjectName

CodeBuild project name.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### CliCommand

A Maestro CLI command (without the ./maestro-admin part)

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RoleArn

IAM role with permissions to execute the given Admin CLI command.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Hydration

_Required_: Yes

_Type_: <a href="hydrationoptions.md">HydrationOptions</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the InvocationId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### InvocationId

Returns the <code>InvocationId</code> value.

#### CommandOutput

Returns the <code>CommandOutput</code> value.

