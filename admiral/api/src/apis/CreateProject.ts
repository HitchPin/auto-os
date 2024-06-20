import type { Handler, PartialProxyEvent } from "./Handler";
import type { Project, InternalProject } from "../schema";
import { ProjectSchema } from "../schema";
import { BadRequestError } from "../AdmiralError";
import { IProjectManager } from "../data/Types";
import { ZodError } from "zod";

interface CreateProjectRequest {
    tenantName: string,
    project: Project
}
interface CreateProjectResponse {
    id: string
}

export interface ICreateProjectHandler extends Handler<CreateProjectRequest, CreateProjectResponse> {};

export class CreateProjectHandler implements ICreateProjectHandler {

    readonly #projectManager: IProjectManager;

    constructor(projectManager: IProjectManager) {
        this.#projectManager = projectManager;
    }

    get name(): string {
        return 'CreateProject';
    }
    get httpMethod(): 'PUT' {
        return 'PUT';
    }
    get path() {
        return new RegExp('\\/tenants\\/(?<tenantName>[a-zA-Z0-9\\-+]{4,})\\/projects\\/?$');
    }

    handle = async (req: CreateProjectRequest): Promise<CreateProjectResponse> => {

        const id = await this.#projectManager.addProject(req.tenantName, req.project);
        return {
            id: id
        };
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): CreateProjectRequest => {
        try {
            const obj = JSON.parse(r.body!);
            const project: Project = ProjectSchema.parse(obj);
            return {
                tenantName: pathParams.get('tenantName')!,
                project: project
            }
        } catch (err) {
            const error = err as ZodError;
            throw new BadRequestError(`Invalid request:\n${error.format()._errors.join('; ')}`);
        }
    }
}