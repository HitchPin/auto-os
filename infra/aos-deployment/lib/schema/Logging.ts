import { z } from "zod";

const LogGroupNameSchema = z.string();
const IndividualLogGroupNames = z.object({
  search: LogGroupNameSchema,
  searchServer: LogGroupNameSchema,
  indexingSlow: LogGroupNameSchema,
  searchSlow: LogGroupNameSchema,
  taskDetails: LogGroupNameSchema,
});
const SeparateLogSchema = z.object({
  enabled: z.literal(true),
  logGroupNames: IndividualLogGroupNames,
});
const CombinedLogSchema = z.object({
  enabled: z.literal(true),
  logGroupName: z.string(),
});
const DisabledLogSchema = z.object({
  enabled: z.literal(false),
});
const LoggingSchema = z.union([
  CombinedLogSchema,
  SeparateLogSchema,
  DisabledLogSchema,
]);

type LoggingProps = z.infer<typeof LoggingSchema>;
export { LoggingSchema };
export type { LoggingProps };