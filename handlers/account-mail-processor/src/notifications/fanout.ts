import { IFan, EventInfo } from "./fan";
import { EventBridge } from '@aws-sdk/client-eventbridge';

interface FanoutFanProps {
    fans: IFan[]
}

export class FanoutFan implements IFan {

    readonly #fans: IFan[];

    get serviceName() {
        return 'multiple';
    }

    constructor(p: FanoutFanProps) {
        this.#fans = p.fans;
    }

    send = async (e: EventInfo): Promise<string> => {

        const done = await Promise.allSettled(this.#fans.map(f => (async () => {
            const r = await f.send(e);
            return `${f.serviceName}:${r}`;
        })()));
        const successes = done.filter(z => z.status === 'fulfilled').map(z => z.value);
        const failureErrors = done.filter(z => z.status === 'rejected').map(z => z.reason);
        if (failureErrors.length > 0) {
            console.error(`Failed to notify these:`);
            failureErrors.forEach(e => {
                console.log(e);
            });
        }
        return successes.join('\n');
    }
 }