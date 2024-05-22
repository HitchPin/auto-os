import * as p from "child_process";
import * as path from 'path';
import { BazelError } from './BazelError'
import type { ExecSyncOptionsWithStringEncoding } from 'child_process';

type QueryOutputType = |
  'label' |
  'label_kind' |
  'build' |
  'minrank' |
  'maxrank' |
  'package' |
  'location' | 
  'graph' |
  'xml' |
  'proto' |
  'streamed_jsonproto' |
  'streamed_proto';

interface BazelPathProps {
    customBazelPath?: string,
    workspaceRoot?: string,
    packageName: string,
    target?: string
}

const getExecOutput = (cmd: string, op?: ExecSyncOptionsWithStringEncoding) => {
  try {
    return p.execSync(cmd, {
      ...op,
      stdio: 'pipe'
    }).toString().trim();
  } catch (err) {
    throw new BazelError("ExecutionError", "Could not execute query.", err as Error);
  }
};
const verifyVersion = (ps: string) => {
    try {
        return getExecOutput(`${ps} --version`).toString().trim();
    } catch (err) {
        throw new Error("Unable to find a valid Bazel installation.")
    }
}

const getWorkspaceRoot = (bazelCmd: string, cwd?: string) => {
    try {
      return getExecOutput(`${bazelCmd} info workspace`, cwd ? { cwd: cwd!, encoding: 'utf8' } : { encoding: 'utf8' }).toString().trim();
    } catch (err) {
      throw new Error("Unable to find a valid Bazel workspace root.");
    }
}

const OUTPUT_ARTIFACT_QUERY = `target.files.to_list()[0].path`;

class BazelClient {
  private readonly bazelPath: string;
  private readonly workspaceRoot: string;
  constructor(bazelPath?: string, workspaceRoot?: string) {
    const bazel = bazelPath ?? "bazel";
    verifyVersion(bazel);
    this.bazelPath = bazel;
    this.workspaceRoot = workspaceRoot ?? getWorkspaceRoot(bazel);
  }

  get infoKeys(): Map<string, string> {
    const output = this.bzl("info");
    const lines = output.split("\n");
    const m = new Map<string, string>();
    lines.forEach((l) => {
      const fc = l.indexOf(":");
      const k = l.substring(0, fc);
      const v = l.substring(fc + 1).trim();
      m.set(k, v);
    });
    return m;
  }

  artifactOf = (pkg: string, target: string) =>
    this.starlarkCquery(pkg, target, OUTPUT_ARTIFACT_QUERY);

  starlarkCquery = (
    pkg: string,
    target: string,
    starlarkExpression: string
  ): string => {
    const args = `cquery ${pkg}:${target} --output=starlark --starlark:expr='${starlarkExpression}'`;
    return this.bzl(args);
  };

  query = (
    packagePath: string,
    target: string,
    queryFormat: QueryOutputType
  ): string => {
    return this.bzl(`query ${packagePath}:${target} --output ${queryFormat}`);
  };

  private bzl(args: string): string {
    return getExecOutput(`${this.bazelPath} ${args}`, {
      cwd: this.workspaceRoot,
      encoding: "utf8",
    });
  }

  static create(bazelPath?: string, workspaceRoot?: string): BazelClient {
    const bazel = bazelPath ?? "bazel";
    verifyVersion(bazel);

    const wsRoot = workspaceRoot ?? getWorkspaceRoot(bazel);
    return new BazelClient(bazel, wsRoot);
  }
}


export { verifyVersion, BazelClient, BazelError};