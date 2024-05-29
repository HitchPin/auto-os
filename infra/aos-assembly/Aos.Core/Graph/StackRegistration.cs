using System;
using System.Collections.Generic;

namespace Aos.Core.Graph;


public record StackRegistration(string StackName, Type StackType)
{
    public List<StackRegistration> Dependencies { get; } = new List<StackRegistration>();
}