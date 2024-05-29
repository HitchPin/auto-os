using System.Text.Json.Serialization;

namespace Aos.Rich.Serialization;

public record JsonPrincipal
{
    public const string AWSKey = "AWS";
    public const string ServiceKey = "Service";
    public const string FederatedKey = "Federated";
    public const string CanonicalUserKey = "CanonicalUser";
    private JsonPrincipal()
    {
    }
    
    public bool IsStar { get; private set; }
    public StarrableArray? AWS { get; private set; }
    public StarrableArray? Service { get; private set; }
    public StarrableArray? Federated { get; private set; }
    public StarrableArray? CanonicalUser { private get; set; }

    public JsonPrincipal WithAWS(StarrableArray aws) => this with
    {
        AWS = (AWS == default) ? aws : (AWS + aws)
    };
    public JsonPrincipal ReplaceAWS(StarrableArray aws) => this with
    {
        AWS = aws
    };
    public JsonPrincipal WithService(StarrableArray service) => this with
    {
        Service = (Service == default) ? service : (Service + service)
    };
    public JsonPrincipal ReplaceService(StarrableArray service) => this with
    {
        Service = service
    };
    public JsonPrincipal WithFederated(StarrableArray federated) => this with
    {
        Federated = (Federated == default) ? federated : (Federated + federated)
    };
    public JsonPrincipal ReplaceFederated(StarrableArray federated) => this with
    {
        Federated = federated
    };
    public JsonPrincipal WithCanonicalUser(StarrableArray canonicalUser) => this with
    {
        CanonicalUser = (CanonicalUser == default) ? canonicalUser : (CanonicalUser + canonicalUser)
    };
    public JsonPrincipal ReplaceCanonicalUser(StarrableArray canonicalUser) => this with
    {
        CanonicalUser = canonicalUser
    };

    public static JsonPrincipal NoPrincipals()
    {
        return new JsonPrincipal();
    }
    public static JsonPrincipal AllPrincipals()
    {
        return new JsonPrincipal()
        {
            IsStar = true
        };
    }
    public static JsonPrincipal OfAWS(StarrableArray a)
    {
        return new JsonPrincipal()
        {
            AWS = a
        };
    }
    public static JsonPrincipal OfService(StarrableArray s)
    {
        return new JsonPrincipal()
        {
            Service = s
        };
    }
    public static JsonPrincipal OfFederated(StarrableArray s)
    {
        return new JsonPrincipal()
        {
            Federated = s
        };
    }
    public static JsonPrincipal OfCanonicalUser(StarrableArray s)
    {
        return new JsonPrincipal()
        {
            CanonicalUser = s
        };
    }

    public static JsonPrincipal operator +(JsonPrincipal p1, JsonPrincipal p2)
    {
        if (p1.IsStar || p2.IsStar) return JsonPrincipal.AllPrincipals();

        return new JsonPrincipal()
        {
            AWS = p1.AWS + p2.AWS,
            Service = p1.Service + p2.Service,
            Federated = p1.Federated + p2.Federated,
            CanonicalUser = p1.CanonicalUser + p2.CanonicalUser
        };

    }
}