import { z } from "zod";

const NodeCapabilitySchema = z.union([
  z.literal("Data"),
  z.literal("ML"),
  z.literal("Ingest"),
  z.literal("RemoteClient"),
  z.literal("SnapshotSearch"),
]);
const NodeTypeSchema = z.union([
  z.literal("DedicatedManager"),
  z.literal("DedicatedCoordinator"),
  z.array(NodeCapabilitySchema),
]);

const NodeSpecSchema = z.object({
  minCount: z.number().min(1),
  maxCount: z.number().min(1),
  type: NodeTypeSchema,
  capacityProviderName: z.string(),
});

type NodeCapability = z.infer<typeof NodeCapabilitySchema>;
type NodeType = z.infer<typeof NodeTypeSchema>;
type NodeSpecProps = z.infer<typeof NodeSpecSchema>;

const TopologySchema = z.object({
  nodeSpecifications: z.array(NodeSpecSchema).min(1),
  zoneAwareness: z.boolean()
});
type TopologyProps = z.infer<typeof TopologySchema>;
export type { TopologyProps, NodeSpecProps, NodeCapability, NodeType };
export { TopologySchema, NodeSpecSchema  };