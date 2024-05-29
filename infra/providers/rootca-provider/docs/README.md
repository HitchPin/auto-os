# HitchPin::AutoOs::RootCA

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "HitchPin::AutoOs::RootCA",
    "Properties" : {
        "<a href="#keysize" title="KeySize">KeySize</a>" : <i>Integer</i>,
        "<a href="#subject" title="Subject">Subject</a>" : <i><a href="subject.md">Subject</a></i>,
        "<a href="#expirationdays" title="ExpirationDays">ExpirationDays</a>" : <i>Double</i>,
        "<a href="#privatekeykmskeyid" title="PrivateKeyKmsKeyId">PrivateKeyKmsKeyId</a>" : <i>String</i>,
        "<a href="#privatekeysecretname" title="PrivateKeySecretName">PrivateKeySecretName</a>" : <i>String</i>,
    }
}
</pre>

### YAML

<pre>
Type: HitchPin::AutoOs::RootCA
Properties:
    <a href="#keysize" title="KeySize">KeySize</a>: <i>Integer</i>
    <a href="#subject" title="Subject">Subject</a>: <i><a href="subject.md">Subject</a></i>
    <a href="#expirationdays" title="ExpirationDays">ExpirationDays</a>: <i>Double</i>
    <a href="#privatekeykmskeyid" title="PrivateKeyKmsKeyId">PrivateKeyKmsKeyId</a>: <i>String</i>
    <a href="#privatekeysecretname" title="PrivateKeySecretName">PrivateKeySecretName</a>: <i>String</i>
</pre>

## Properties

#### KeySize

_Required_: No

_Type_: Integer

_Allowed Values_: <code>1024</code> | <code>2048</code> | <code>4096</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Subject

The subject of the CA.

_Required_: Yes

_Type_: <a href="subject.md">Subject</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ExpirationDays

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### PrivateKeyKmsKeyId

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### PrivateKeySecretName

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### PublicCertificatePem

Returns the <code>PublicCertificatePem</code> value.

#### Serial

Returns the <code>Serial</code> value.

#### PrivateKeySecretArn

Returns the <code>PrivateKeySecretArn</code> value.

