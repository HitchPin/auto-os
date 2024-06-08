interface SnapshotConfig {
  DateFormat?: string;
  DateFormatTimezone?: string;
  Indices?: string[];
  Repository: string;
  IgnoreUnavailable?: boolean;
  IncludeGlobalState?: boolean;
  Partial?: boolean;
  Metadata?: Record<string, string>;
}
interface SnapshotCreation {
  Schedule: string;
  TimeLimit?: string;
}
interface SnapshotDeletionCondition {
  MaxCount?: number;
  MaxAge?: string;
  MinCount?: number;
}
interface SnapshotDeletion {
  Schedule: string;
  TimeLimit?: string;
  Condition?: SnapshotDeletionCondition;
}
interface SnapshotNotificationChannel {
  Id: string;
}
interface SnapshotNotificationCondition {
  Creation?: boolean;
  Deletion?: boolean;
  Failure?: boolean;
  TimeLimitExceeded?: boolean;
}
interface SnapshotNotification {
  Channel?: SnapshotNotificationChannel;
  Conditions?: SnapshotNotificationCondition;
}
export interface CreateSnapshotPolicyRequest {
  PolicyName: string;
  Description?: string;
  Enabled?: boolean;
  SnapshotConfig: SnapshotConfig;
  Creation: SnapshotCreation;
  Deletion?: SnapshotDeletion;
  Notification?: SnapshotNotification;
}
