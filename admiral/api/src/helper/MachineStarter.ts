import { SFN } from '@aws-sdk/client-sfn';
import type { MachineContext } from '../machine';

export class MachineStarter {

    #sfn: SFN;
    #machineArn: string;

    constructor(sfn: SFN, machineArn: string) {
        this.#sfn = sfn;
        this.#machineArn = machineArn;
    }   

    start = async (context: MachineContext): Promise<string> => {
        const r = await this.#sfn.startExecution({
            stateMachineArn: this.#machineArn,
            input: JSON.stringify(context)
        });
        return r.executionArn!;
    }
}