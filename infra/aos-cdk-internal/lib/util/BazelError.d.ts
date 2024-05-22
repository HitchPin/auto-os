type ErrorTypes = 'ExecutionError';
export declare class BazelError extends Error {
    readonly cause?: Error;
    constructor(errType: ErrorTypes, message: string, cause?: Error);
}
export {};
