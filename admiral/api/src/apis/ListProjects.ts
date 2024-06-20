import type { Handler, PartialProxyEvent } from "./Handler";
import type { Project, InternalProject } from "../schema";
import { ProjectSchema } from "../schema";
import { BadRequestError } from "../AdmiralError";
import { IProjectManager } from "../data/Types";
import { ZodError } from "zod";

interface ListProjectsRequest {
    tenantName: string
}
interface ListProjectsRespose {
    projects: string[]
}

export interface IListProjectsHandler extends Handler<ListProjectsRequest, ListProjectsRespose> {};

export class ListProjectsHandler implements IListProjectsHandler {

    readonly #projectManager: IProjectManager;

    constructor(projectManager: IProjectManager) {
        this.#projectManager = projectManager;
    }

    get name(): string {
        return 'ListProjects';
    }
    get httpMethod(): 'GET' {
        return 'GET';
    }
    get path() {
        return new RegExp('\\/tenants\\/(?<tenantName>[a-zA-Z0-9\\-+]{4,})\\/projects\\/?$');
    }

    handle = async (req: ListProjectsRequest): Promise<ListProjectsRespose> => {

        const projectNames = await this.#projectManager.listTenantProjects(req.tenantName);
        return {
            projects: projectNames
        };
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): ListProjectsRequest => {
        return {
            tenantName: pathParams.get('tenantName')!
        }
    }
}