import { Construct } from 'constructs';
import { RemoteOutputs } from 'cdk-remote-stack';
import {
    aws_iam as iam,
    Aws,
    App,
    Stack
} from 'aws-cdk-lib';


interface OrgInfoProps {
    orgAdminAccountId: string,

}

export class OrgInfo extends Construct {

    private readonly remoteOutputs: RemoteOutputs;

    get clusterAccountsOuId(): string {
        return this.remoteOutputs.get('ClusterAccountsOuId');
    }

    private constructor(parent: Construct, name: string, props: OrgInfoProps) {
        super(parent, name);

        const s = App.of(this)!.node.findChild('Provisioner') as Stack;
        this.remoteOutputs = new RemoteOutputs(this, 'Outputs', {
            stack: s,
            alwaysUpdate: true
        });
    }

    static of(parent: Construct, adminId: string) {
        const stack = Stack.of(parent);

        const id = `org-info-${adminId}`;
        const pConstruct =
            (stack.node.tryFindChild(id) as OrgInfo) ||
            new OrgInfo(stack, id, { orgAdminAccountId: adminId });
        return pConstruct;
    }
}