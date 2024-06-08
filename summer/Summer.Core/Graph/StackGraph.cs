using System;
using System.Collections.Generic;
using System.Linq;

namespace Summer.Core.Graph;

public class StackGraph
{
    private readonly List<StackRegistration> registrations;

    public StackGraph(List<PartialStackRegistration> rs)
    {
        this.registrations = PartialToFullRegistrations(rs);
    }

    public List<string> Stacks => registrations.Select(r => r.StackName).ToList();
    public StackRegistration GetByType(Type t) => registrations
        .First(a => a.StackType == t);
    public StackRegistration GetByName(string name) => registrations
        .First(a => a.StackName.ToString() == name);

    
    public List<StackRegistration> CreateDeployOrder(StackRegistration r)
    {
        var hs = new HashSet<StackRegistration>();
        var s = new Stack<StackRegistration>();
        var stacksByType = registrations.ToDictionary(s => s.StackType);

        void Push(StackRegistration r)
        {
            if (hs.Add(r))
            {
                s.Push(r);
            }
        }
        s.Push(r);
        var finalOrder = new List<StackRegistration>();
        while (s.Count > 0)
        {
            var top = s.Pop();
            if (top.Dependencies.Count > 0)
            {
                foreach (var d in top.Dependencies)
                {
                    var regForD = stacksByType[d.StackType];
                    Push(regForD!);
                }
            }
            finalOrder.Add(top);
        }

        finalOrder.Reverse();
        return finalOrder;
    }


    internal static List<StackRegistration> PartialToFullRegistrations(List<PartialStackRegistration> rs)
    {
        var srs = new Dictionary<Type, StackRegistration>();
        foreach (var p in rs)
        {
            srs.Add(p.StackType, new StackRegistration(p.StackName, p.StackType));
        }
        foreach (var p in rs)
        {
            var myReg = srs[p.StackType];
            foreach (var d in p.StackDependencies)
            {
                if (!srs.ContainsKey(d)) continue;
                var dReg = srs[d];
                myReg.Dependencies.Add(dReg);
            }
        }

        return srs.Values.ToList();
    }
}