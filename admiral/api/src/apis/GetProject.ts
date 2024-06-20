import type { Handler, PartialProxyEvent } from "./Handler";
import type { InternalProject } from "../schema";
import { IProjectManager } from "../data/Types";

interface GetProjectRequest {
    tenantName: string,
    projectName: string
}
type GetProjectResponse = InternalProject;

export interface IGetProjectHandler extends Handler<GetProjectRequest, GetProjectResponse> {};

export class GetProjectHandler implements IGetProjectHandler {

    readonly #projectManager: IProjectManager;

    constructor(projectManager: IProjectManager) {
        this.#projectManager = projectManager;
    }

    get name(): string {
        return 'GetProject';
    }
    get httpMethod(): 'GET' {
        return 'GET';
    }
    get path() {
        return new RegExp('\\/tenants\\/(?<tenantName>[a-zA-Z0-9\\-+]{4,})\\/projects\\/(?<projectName>[a-zA-Z0-9\\-+]{4,})\\/?$');
    }

    handle = async (req: GetProjectRequest): Promise<GetProjectResponse> => {

        const project = await this.#projectManager.getProject(req.tenantName, req.projectName);
        return project;
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): GetProjectRequest => {
        return {
            tenantName: pathParams.get('tenantName')!,
            projectName: pathParams.get('projectName')!,
        }
    }
}