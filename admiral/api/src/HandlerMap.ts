import * as apis from './apis';
import type { PartialProxyEvent } from './apis/Handler';

export class HandlerMap {
    #m: Map<'GET' | 'PUT' | 'POST' | 'DELETE', apis.Handler<any, any>[]>;

    constructor() {
        this.#m = new Map<'GET' | 'PUT' | 'POST' | 'DELETE', apis.Handler<any, any>[]>();
    }

    addHandler<TReq, TRes>(h: apis.Handler<TReq, TRes>) {
        const m = h.httpMethod!;
        if (!this.#m.has(m)) {
            this.#m.set(m, [h]);
        } else {
            this.#m.get(m)?.push(h);
        }
    }

    getHandler(r: PartialProxyEvent): apis.Handler<any, any> | undefined {
        const m = r.httpMethod!.toUpperCase() as 'GET' | 'PUT' | 'POST' | 'DELETE';
        const handlers = this.#m.get(m);
        if (!handlers) {
            return undefined;
        }
        for (let h of handlers) {
            if (r.path.match(h.path)) {
                console.log(`Resolved event to handler ${h.name}`)
                return h;
            }
        }
        return undefined;
    }

}