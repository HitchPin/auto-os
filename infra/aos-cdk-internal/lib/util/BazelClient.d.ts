import { BazelError } from './BazelError';
type QueryOutputType = 'label' | 'label_kind' | 'build' | 'minrank' | 'maxrank' | 'package' | 'location' | 'graph' | 'xml' | 'proto' | 'streamed_jsonproto' | 'streamed_proto';
declare const verifyVersion: (ps: string) => string;
declare class BazelClient {
    private readonly bazelPath;
    private readonly workspaceRoot;
    constructor(bazelPath?: string, workspaceRoot?: string);
    get infoKeys(): Map<string, string>;
    artifactOf: (pkg: string, target: string) => string;
    starlarkCquery: (pkg: string, target: string, starlarkExpression: string) => string;
    query: (packagePath: string, target: string, queryFormat: QueryOutputType) => string;
    private bzl;
    static create(bazelPath?: string, workspaceRoot?: string): BazelClient;
}
export { verifyVersion, BazelClient, BazelError };
