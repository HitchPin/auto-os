using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Pulumi;
using Summer.Core;
using Summer.IAM.Principals;
using Summer.IAM.Serialization;

namespace Summer.IAM.Policies;

public record PolicyStatement
{
    public string? Sid { get; private init; }
    
    public Output<StarrableArray>? Actions { get; private init; } 
    public Output<StarrableArray>? NotActions { get; private init; }
    public Output<StarrableArray>? Resources { get; private init; }
    public Output<StarrableArray>? NotResources { get; private init; }
    
    public Output<Conditions>? Conditions { get; private init; }
    public Effect Effect { get; private init; } = Effect.Allow;

    public PolicyStatement WithSid(string sid) => this with { Sid = sid };
    public PolicyStatement WithEffect(Effect effect) => this with { Effect = effect };
    
    #region "Actions"

    public PolicyStatement WithAction(string action) => WithAction(Output.Create(StarrableArray.Of(action)));
    public PolicyStatement WithAction(StarrableArray arr) => WithAction(Output.Create(arr));
    public PolicyStatement WithAction(Output<string> action) => WithAction(action.Apply(a => StarrableArray.Of(a)));
    public PolicyStatement WithAction(Output<StarrableArray> newActions) => WithExactActionArray(Actions == null
        ? newActions
        : Output.Tuple(newActions, this.Actions!).Apply(result =>
        {
            var (newAction, existingAction) = result;
            return newAction + existingAction;
        }));
    
    public PolicyStatement ReplaceActions(Output<StarrableArray> arr) => WithExactActionArray(arr);
    private PolicyStatement WithExactActionArray(Output<StarrableArray> arr)
    {
        if (NotActions != default)
        {
            throw new ArgumentException("You cannot set both Actions and not actions in the same policy statement.");
        }

        return this with
        {
            Actions = arr
        };
    }
    #endregion
    
    #region "Not Actions"
    
    public PolicyStatement WithNotAction(string notAction) =>
        WithNotAction(Output.Create(StarrableArray.Of(notAction)));
    public PolicyStatement WithNotAction(StarrableArray notAction) =>
        WithNotAction(Output.Create(notAction));
    public PolicyStatement WithNotAction(Output<string> notAction) =>
        WithNotAction(notAction.Apply(na => StarrableArray.Of(na)));
    public PolicyStatement WithNotAction(Output<StarrableArray> newNotActions) => WithExactNotActionArray(NotActions == null
        ? newNotActions
        : Output.Tuple(newNotActions!, this.NotActions!).Apply(result =>
        {
            var (nna, existingAction) = result;
            return nna + existingAction;
        }));
    
    public PolicyStatement ReplaceNotActions(Output<StarrableArray> arr) => WithExactNotActionArray(arr);
    private PolicyStatement WithExactNotActionArray(Output<StarrableArray> arr)
    {
        if (Actions != default)
        {
            throw new ArgumentException("You cannot set both Actions and not actions in the same policy statement.");
        }

        return this with
        {
            NotActions = arr
        };
    }
    
    #endregion
    
    #region "Resources"

    public PolicyStatement WithResource(string rsrc) => WithResource(Output.Create(StarrableArray.Of(rsrc)));
    public PolicyStatement WithResource(StarrableArray arr) => WithResource(Output.Create(arr));
    public PolicyStatement WithResource(Output<string> rsrc) => WithResource(rsrc.Apply(r => StarrableArray.Of(r)));
    public PolicyStatement WithResource(Output<StarrableArray> arr)
    {
        Output<StarrableArray> outputArr;
        if (Resources == null) outputArr = arr;
        else
        {
            outputArr = Output.All(Resources, arr).Apply(a => a[0] + a[1]);
        }

        return WithExactResourceArray(outputArr);
    }

    public PolicyStatement ReplaceResources(Output<StarrableArray> arr) => WithExactResourceArray(arr);
    private PolicyStatement WithExactResourceArray(Output<StarrableArray> arr)
    {
        if (NotResources != default)
        {
            throw new ArgumentException("You cannot set both Resources and NotResources in the same policy statement.");
        }

        return this with
        {
            Resources = arr
        };
    }
    #endregion

    #region "Not Resources"
    
    public PolicyStatement WithNotResource(string notRsrc) => WithNotResource(Output.Create(StarrableArray.Of(notRsrc)));
    public PolicyStatement WithNotResource(StarrableArray notRsrc) => WithNotResource(Output.Create(notRsrc));
    public PolicyStatement WithNotResource(Output<string> notRsrc) => WithNotResource(notRsrc.Apply(a => StarrableArray.Of(a)));
    public PolicyStatement WithNotResource(Output<StarrableArray> notRsrc) => WithExactNotResourceArray(notRsrc);
    
    private PolicyStatement WithExactNotResourceArray(Output<StarrableArray> arr)
    {
        if (Resources != default)
        {
            throw new ArgumentException("You cannot set both Resources and NotResources in the same policy statement.");
        }

        return this with
        {
            NotResources = arr
        };
    }
    #endregion

    public Output<string> ToJson()
    {
        var converter = new JsonPrincipalJsonConverter();
        var arrConverter = new StarrableArrayJsonConverter();
        var condConverter = new ConditionsJsonConverter();
        Output<JsonPrincipal> principalJsonOutput = null;
        Output<StarrableArray> principalActionsOutput = null;
        if (this is TrustPolicyStatement trustStmt)
        {
            if (trustStmt.Principals != null)
            {
                principalJsonOutput = trustStmt.Principals.PrincipalJson;
                principalActionsOutput = trustStmt.Principals.AssumeRoleAction;
            }
            else if (trustStmt.NotPrincipals != null)
            {
                principalJsonOutput = trustStmt.NotPrincipals.PrincipalJson;
                principalActionsOutput = trustStmt.NotPrincipals.AssumeRoleAction;
            }

            throw new ArgumentException("TrustPolicyStatement has no principal.");
        }

        using var ms = new MemoryStream();
        var writer = new Utf8JsonWriter(ms);
        var jsonOptions = new JsonSerializerOptions();

        Output<NullableOutput<Q>> W<Q>(Output<Q>? output)
        {
            if (output != null) return output.Apply(o => new NullableOutput<Q>(o));
            return Output.Create(new NullableOutput<Q>());
        }
        return Output.Tuple(
            W(Resources), W(NotResources),
            W(Actions), W(NotActions),W(Conditions),
            W(principalJsonOutput)!, W(principalActionsOutput!)).Apply(result =>
        {
            var (
                rsrcJsonN, notRsrcJsonN,
                actionsN, notActionsN,
                conditionsN, principalJson, principalActions) = result;

            writer.WriteStartObject();
            if (!string.IsNullOrEmpty(Sid))
            {
                writer.WriteString("Sid", Sid);
            }

            var actions = actionsN.IsNull ? new StarrableArray() : actionsN.Value;
            if (this is TrustPolicyStatement trustStmt)
            {
                if (trustStmt.Principals != null)
                {
                    writer.WritePropertyName("Principal");
                    converter.Write(writer, principalJson.Value, jsonOptions);
                }
                else if (trustStmt.NotPrincipals != null)
                {
                    writer.WritePropertyName("NotPrincipal");
                    converter.Write(writer, principalJson.Value, jsonOptions);
                }

                actions += principalActions.Value!;
            }

            writer.WriteString("Effect", this.Effect == Effect.Allow ? "Allow" : "Deny");
            if (!actions.IsEmpty)
            {
                writer.WritePropertyName("Action");
                arrConverter.Write(writer, actions!, jsonOptions);
            }
            else if (!notActionsN.IsNull)
            {
                writer.WritePropertyName("NotAction");
                arrConverter.Write(writer, notActionsN.Value, jsonOptions);
            }
            if (!rsrcJsonN.IsNull)
            {
                writer.WritePropertyName("Resource");
                arrConverter.Write(writer, rsrcJsonN.Value, jsonOptions);
            }
            else if (!notRsrcJsonN.IsNull)
            {
                writer.WritePropertyName("NotResource");
                arrConverter.Write(writer, notRsrcJsonN.Value, jsonOptions);
            }

            if (!conditionsN.IsNull)
            {
                writer.WritePropertyName("Conditions");
                condConverter.Write(writer, conditionsN.Value, jsonOptions);
            }
            
            writer.WriteEndObject();
            writer.Flush();
            var bin = ms.ToArray();
            var str = Encoding.UTF8.GetString(bin);
            return str;
        });
    }
}