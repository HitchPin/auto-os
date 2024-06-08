import { z } from "zod";
import cron from "cron-validate";

const SnapshottingSchema = z.object({
  bucketName: z.string(),
  prefix: z.string().optional(),
  schedule: z.string().refine((v) => cron(v).isValid()),
});
type SnapshottingProps = z.infer<typeof SnapshottingSchema>;
export type { SnapshottingProps };
export { SnapshottingSchema };
