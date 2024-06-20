import { ControlTower } from '@aws-sdk/client-controltower';
import { toCfnManifest } from './manifest';
import type { FiefdomManifest } from '@auto-os/opensearch-schemas';

interface Versions {
    current: string,
    latestActive?: string
}
class TowerManager {

    #client: ControlTower;

    constructor(ct?: ControlTower) {
        this.#client = ct ?? new ControlTower();
    }

    create = async (manifest: FiefdomManifest): Promise<{arn: string, opId: string}> => {
        const cfnManifest = toCfnManifest(manifest);
        const upRes = await this.#client.createLandingZone({
            manifest: cfnManifest as unknown as any,
            version: '1'
        });
        return { arn: upRes.arn!, opId: upRes.operationIdentifier!};
    }

    checkCreateStatus = async (id: string): Promise<boolean | Error> => {
        const opR = await this.#client.getLandingZoneOperation({
            operationIdentifier: id,
        })
        if (opR.operationDetails!.status === 'FAILED') {
            return new Error(opR.operationDetails!.statusMessage!);
        }
        return opR.operationDetails!.status! === 'IN_PROGRESS';
    }

    updateManifest = async (lzId: string, manifest: FiefdomManifest): Promise<string> => {
        const cfnManifest = toCfnManifest(manifest);
        const upRes = await this.#client.updateLandingZone({
            landingZoneIdentifier: lzId,
            manifest: cfnManifest as unknown as any,
            version: '1'
        })
        return upRes.operationIdentifier!;
    }

    getCurrentVersions = async (lzId: string): Promise<Versions> => {
        const r = await this.#client.getLandingZone({ landingZoneIdentifier: lzId });
        return { 
            current: r.landingZone!.version!,
            latestActive: r.landingZone!.latestAvailableVersion
        }
    }
}

export { TowerManager }