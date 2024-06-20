import { cdk, javascript } from "projen";
const project = new cdk.JsiiProject({
  author: "Johnathan",
  authorAddress: "johnathan@auto-os.dev",
  defaultReleaseBranch: "main",
  docgen: true,
  eslint: false,
  jsiiVersion: "~5.4.0",
  name: "wing-opensearch",
  packageManager: javascript.NodePackageManager.PNPM,
  prettier: true,
  projenrcTs: true,
  repositoryUrl: "https://github.com/johnathan/wing-opensearch-t3.git",
  vscode: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  packageName: "@auto-os/wing-opensearch"
});
project.synth();