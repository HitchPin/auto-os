import {
    aws_ec2 as ec2
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from "path";
import type { ClusterRoleType } from '../Types';

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

const getScriptLines = (crt: ClusterRoleType, replacements: Record<string, string>): string[] => {
    const fileName = crt === 'bootstrapper' ? 'bootstrapper-setup.sh' : 'node-setup.sh';
    const loc = path.join(__dirname, fileName);
    let txt = fs.readFileSync(loc).toString('utf8');
    Object.keys(replacements).forEach(k => {
        const r = replacements[k];
        txt = replaceAll(txt, k, r);
    })
    return txt.split('\n');
}


interface SetupUserDataProps {
  maestroApiEndpoint: string;
  clusterRole: ClusterRoleType;
}
export class SetupUserData extends Construct {

    userData: ec2.UserData;

    constructor(parent: Construct, name: string, props: SetupUserDataProps) {
        super(parent, name);

        const lines = getScriptLines(props.clusterRole, {
          "%MAESTRO_ENDPOINT%": props.maestroApiEndpoint,
          "%OS_USAGE%": props.clusterRole,
          "%REGION%": cdk.Aws.REGION,
        });

        const ud = ec2.UserData.forLinux({});
        ud.addCommands(...lines)
        this.userData = ud;
    }
}

