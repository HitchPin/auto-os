type ErrorTypes = |
    'ExecutionError';

export class BazelError extends Error {
  readonly cause?: Error;

  constructor(errType: ErrorTypes, message: string, cause?: Error) {
    super(message);
    this.name = errType;
    this.cause = cause;
  }
}
