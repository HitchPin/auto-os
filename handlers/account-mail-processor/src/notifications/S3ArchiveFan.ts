import { IFan, EventInfo } from "./fan";
import { S3 } from "@aws-sdk/client-s3";

interface S3ArchiveFanProps {
    bucketName: string,
    prefix?: string,
    client?: S3
}

export class S3ArchiveFan implements IFan {

    readonly #client: S3;
    readonly #bucket: string;
    readonly #prefix: string;

    get serviceName(): string {
        return 's3archiver';
    }

    constructor(p: S3ArchiveFanProps) {
        this.#client = p.client ?? new S3();
        this.#bucket = p.bucketName;
        if (p.prefix) {
            let prefix = p.prefix!;
            if (prefix.endsWith('/')) {
                prefix = prefix.substring(0, prefix.length - 1);
            }
            if (prefix.startsWith('/')) {
                prefix = prefix.substring(1);
            }
            this.#prefix = prefix + '/';
        } else {
            this.#prefix = '';
        }
    }

    send = async (e: EventInfo): Promise<string> => {
        const key = this.keyFor(e);
        await this.#client.putObject({
          Bucket: this.#bucket,
          Key: key,
          Body: JSON.stringify(e.email),
          ContentType: 'application/json'
        });
        return key;
    }
    
    keyFor = (e: EventInfo): string => {
        return `${this.#prefix}${e.tenantId}/${e.projectId}/${e.email.timestamp}-${e.email.messageId}`
    }

    s3UrlFor = (e: EventInfo): string => {
        const k = this.keyFor(e);
        return `s3://${this.#bucket}/${k}`;
    }
 }