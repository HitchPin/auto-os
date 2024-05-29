using System;
using System.Collections.Generic;

namespace Aos.Core.Graph;

public record PartialStackRegistration(string StackName, Type StackType, List<Type> StackDependencies);