namespace Summer.Environment;

public readonly record struct Token<T>
{
    public readonly string key;

    public Token(string key)
    {
        this.key = key;
    }
}