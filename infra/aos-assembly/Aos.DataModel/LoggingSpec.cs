using System.Text.Json.Serialization;

namespace Aos.DataModel;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "__loggingType")]
[JsonDerivedType(typeof(DisabledLogging), typeDiscriminator: "disabled")]
[JsonDerivedType(typeof(CombinedLogging), typeDiscriminator: "combined")]
[JsonDerivedType(typeof(IndividualLogging), typeDiscriminator: "individual")]
public abstract record LoggingSpec
{
    public abstract string? NameForStream(LogStream ls);

    public static LoggingSpec Disabled() => new DisabledLogging();
    public static LoggingSpec Combined(string logGroupName) => new CombinedLogging() { LogGroupName = logGroupName};
    public static LoggingSpec Individual() => new IndividualLogging();
    
    public record DisabledLogging : LoggingSpec
    {
        public override string? NameForStream(LogStream ls) => null;
    }
    
    public record CombinedLogging : LoggingSpec
    {
        public string LogGroupName { get; init; }
        public override string? NameForStream(LogStream ls) => LogGroupName;
    }
    
    public record IndividualLogging : LoggingSpec
    {
        public string Search { get; init; }
        public string SearchServer { get; init; }
        public string SearchSlow { get; init; }
        public string IndexingSlow { get; init; }
        public string TaskDetails { get; init; }
        
        public override string? NameForStream(LogStream ls) => ls switch
        {
            LogStream.Search => Search,
            LogStream.SearchServer => SearchServer,
            LogStream.SearchSlow => SearchSlow,
            LogStream.IndexingSlow => IndexingSlow,
            LogStream.TaskDetails => TaskDetails,
        };
    }
}