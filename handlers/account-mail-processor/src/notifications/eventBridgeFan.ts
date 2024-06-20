import { SESMail } from "aws-lambda";
import { IFan, EventInfo } from "./fan";
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { S3ArchiveFan } from "./S3ArchiveFan";

interface EventBridgeProps {
    eventBusName: string,
    s3Fan: S3ArchiveFan;
    client?: EventBridge
}

export class EventBridgeFan implements IFan {

    readonly #client: EventBridge;
    readonly #eventBus: string;
    readonly #s3Fan: S3ArchiveFan;

    get serviceName(): string {
        return 'eventbridge';
    }

    constructor(p: EventBridgeProps) {
        this.#client = p.client ?? new EventBridge();
        this.#eventBus = p.eventBusName;
        this.#s3Fan = p.s3Fan;
    }

    send = async (e: EventInfo): Promise<string> => {

        const r = await this.#client.putEvents({
            Entries: [{
                Source: 'admiral.tenant-mailbox',
                EventBusName: this.#eventBus,
                DetailType: 'Tenant AWS Account Email Received',
                Time: e.timestamp,
                Resources: e.email.commonHeaders.from ?? [],
                Detail: JSON.stringify({
                    'tenant-id': e.tenantId,
                    'project-id': e.projectId,
                    'message-id': e.email.messageId,
                    'email': {
                        'sender': e.email.commonHeaders.sender!,
                        'to': e.email.commonHeaders.to! ?? [],
                        'cc': e.email.commonHeaders.cc! ?? [],
                        'bcc': e.email.commonHeaders.cc! ?? [],
                        'reply-id': e.email.commonHeaders.replyTo ?? [],
                        'subject': e.email.commonHeaders.sender ?? [],
                        'body-s3-url': this.#s3Fan.s3UrlFor(e)
                    }
                })
            }]
        })
        if ((r.FailedEntryCount ?? 0) > 0) {
            const err = r.Entries![0];
            throw new Error(`Failed to public eventbridge event: ${err.ErrorMessage} (code: ${err.ErrorCode}).`);
        }
        return r.Entries![0].EventId!;
    }
 }