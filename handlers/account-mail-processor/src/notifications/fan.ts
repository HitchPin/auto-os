import * as lambda from 'aws-lambda';

export interface IFan {
    send: (sesEmail: EventInfo) => Promise<string>;
    get serviceName(): string;
}
export interface EventInfo {
    tenantId: string,
    projectId: string,
    timestamp: Date,
    email: lambda.SESMail
}