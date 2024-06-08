using System;
using System.Collections.Generic;

namespace Summer.Core.Graph;

public record PartialStackRegistration(string StackName, Type StackType, List<Type> StackDependencies);