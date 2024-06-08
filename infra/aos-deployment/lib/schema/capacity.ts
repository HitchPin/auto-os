import { z } from "zod";
import { InstanceTypeSchema } from "./instanceTypes";

const FargateCapacityProviderSchema = z.object({
  type: z.literal("FARGATE"),
  vCPUs: z.number().min(0.25).max(8),
  memoryMB: z.number(),
  cpuArchitecture: z.enum(["X86_64", "ARM64"]),
});

const EC2AutoScalingCapacityProviderSchema = z.object({
  type: z.literal("EC2_ASG"),
  instanceType: InstanceTypeSchema,
});

const CapacityCommon = z.object({
  capacityProviderName: z.string(),
});

const CapacityProviderSchema = z
  .union([FargateCapacityProviderSchema, EC2AutoScalingCapacityProviderSchema])
  .and(CapacityCommon);

const CapacitySchema = z.object({
  providers: z.array(CapacityProviderSchema),
});

type FargateCapacityProviderProps = z.infer<
  typeof FargateCapacityProviderSchema
>;
type EC2AutoScalingCapacityProviderProps = z.infer<
  typeof EC2AutoScalingCapacityProviderSchema
>;
type CapacityProviderProps = z.infer<typeof CapacityProviderSchema>;
type CapacityProps = z.infer<typeof CapacitySchema>;

export {
  CapacitySchema,
  CapacityProviderSchema,
  FargateCapacityProviderSchema,
  EC2AutoScalingCapacityProviderSchema,
};
export type {
  CapacityProviderProps,
  FargateCapacityProviderProps,
  EC2AutoScalingCapacityProviderProps,
  CapacityProps};
