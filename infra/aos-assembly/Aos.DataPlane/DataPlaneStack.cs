using System.Collections.Generic;
using System.Linq;
using Aos.ControlPlane;
using Aos.DataModel;
using Aos.DataPlane.Components;
using Aos.PlanarFoundation;
using Aos.Substrate;
using Pulumi;

namespace Aos.DataPlane;

public class DataPlaneStack: PlanarStack, IPlanarStack
{
    private readonly Dictionary<NodeSpec, NodeAsg> nodeAsgs = new Dictionary<NodeSpec, NodeAsg>();
    public DataPlaneStack(SubstrateStack subStack, ControlPlaneStack cpStack) : base()
    {
        var clusterParams = new SearchClusterParams()
        {
            Spec = Spec,
            MaestroEndpoint =cpStack.MaestroEndpoint,
            MaestroPolicyArn = cpStack.MaestroApiPolicyArn,
        };

        var sc = new SearchCluster(clusterParams, new ComponentResourceOptions() { Parent = this }, "Search");

        /*
        var capacityProviders = Spec.Capacity.Providers.ToDictionary(c => c.Name);
        foreach (var nodeSpec in Spec.Topology.NodeSpecifications)
        {
            var capProvider = capacityProviders[nodeSpec.CapacityProviderName];
            if (capProvider is not CapacityProviderSpec.EC2AutoScalingCapacityProvider asgProvider)
            {
                continue;
            }
            var pars = new NodeAsgParams()
            {
                Spec = nodeSpec,
                Capacity = asgProvider,

            }
        }
        */
    }

    private void AddEC2NodeSpecs()
    {
        
    }

    public static string Name => "DataPlane";
}