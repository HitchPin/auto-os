using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Pulumi;

namespace Aos.Core.Graph;

public static class Dependencies
{
    public static List<Type> IdentifyStackDependencies<T>(
        Expression<Func<IServiceProvider, T>> factoryExpression,
        ServiceDescriptor descriptor)
    {
        var id = new ConstructorIdentifier<T>();
        var constructor = id.IdentifyConstructor(factoryExpression);
        if (constructor == null) return new List<Type>();
        return constructor.GetParameters()
            .Select(p => p.ParameterType)
            .Where(pt => pt.IsAssignableTo(typeof(Stack)))
            .ToList();
    }
    
    
    public class ConstructorIdentifier<T> : ExpressionVisitor
    {
        private ConstructorInfo? constructor = null;
        public ConstructorInfo? IdentifyConstructor(Expression expression)
        {
            Visit(expression);
            return constructor;
        }

        protected override Expression VisitNew(NewExpression node)
        {
            this.constructor = node.Constructor!;
            return base.VisitNew(node);
        }
        
        protected override Expression VisitBinary(BinaryExpression b)
        {
            if (b.NodeType == ExpressionType.AndAlso)
            {
                Expression left = this.Visit(b.Left);
                Expression right = this.Visit(b.Right);

                // Make this binary expression an OrElse operation instead of an AndAlso operation.
                return Expression.MakeBinary(ExpressionType.OrElse, left, right, b.IsLiftedToNull, b.Method);
            }

            return base.VisitBinary(b);
        }
    }
}