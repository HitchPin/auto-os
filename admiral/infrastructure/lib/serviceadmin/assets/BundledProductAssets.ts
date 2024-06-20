import { Construct } from "constructs";

interface BundledProductAssetsProps {
    bucketName: string,
    versionId: string
}

interface IControlPlaneAssets {
    readonly maestroFuncKey: string;
    readonly discoCleanerFuncKey: string;
    readonly eventForwarderFuncKey: string;
}

export class BundledProductAssets extends Construct {

    #versionId: string;
    readonly bucketName: string;
    private prefixed = (s: string): string => {
        return this.#versionId + '/' + s;
    };

    constructor(parent: Construct, name: string, p: BundledProductAssetsProps) {
        super(parent, name);

        this.#versionId = p.versionId;
        this.bucketName = p.bucketName;
    }

    get controlPlane(): IControlPlaneAssets {
        return {
            maestroFuncKey: this.prefixed('control-plane/maestro-api.zip'),
            discoCleanerFuncKey: this.prefixed('control-plane/disco-cleanup.zip'),
            eventForwarderFuncKey: this.prefixed('control-plane/event-forwarder.zip'),
        }
    }

    get baseConfigPrefix(): string {
        return this.prefixed('base-config/configs/');
    }
}