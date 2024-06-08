namespace Summer.Cli;

public class Loader
{
    private static string GetLocation()
    {
        var matches = Directory.GetFiles(Environment.CurrentDirectory, "*.cxi");
        if (matches.Length == 1)
        {
            return matches[0];
        }

        throw new ArgumentException($"Unable to automatically identify cloud assembly.");
    }
    
}