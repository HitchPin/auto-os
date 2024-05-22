import * as bp from '../../lib/util/BazelClient';

describe('BazelPathUtils', () => {

    test('Accurately validates when bazel exists.', () => {
        bp.verifyVersion('bazel');
    });
    test("Accurately identifies when bazel does not exist.", () => {
        let error: Error | undefined = undefined;
        try {
            bp.verifyVersion("bazela");
        } catch (err) {
            error = err as Error;
        } 
        
        expect(error).toBeDefined();
    });
})

describe('BazelQuery', () => {

    const bq = bp.BazelClient.create();

    test('Gets info keys', () => {
        const ws = bq.infoKeys.get("workspace");
        expect(ws?.endsWith('project-maestro')).toBeTruthy();
    });

    test("Executes starlark cquery", () => {
      const lambdaOutput = bq.starlarkCquery(
        '//maestro/lambda', 'lambda', 'target.files.to_list()[0].path'
      );
      expect(lambdaOutput).toBe(
        "bazel-out/darwin_arm64-fastbuild/bin/maestro/lambda/package.zip"
      );
    });

    test("Finds package target output artifacts", () => {
        const lambdaOutput = bq.artifactOf('//maestro/lambda', 'lambda');
        expect(lambdaOutput).toBe(
          "bazel-out/darwin_arm64-fastbuild/bin/maestro/lambda/package.zip"
        );
    });

});