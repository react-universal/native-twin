import { Array, Effect, Stream } from 'effect';
import { describe, expect, it } from 'vitest';
import { BabelCompilerContext, FSUtils } from '../src';
import { TWIN_DEFAULT_PLUGIN_CONFIG } from '../src/shared/compiler.constants';
import { getBabelAST } from '../src/utils/babel/babel.utils';
import { TestRuntime, getFixture } from './test.utils';

describe('Twin extractor', () => {
  it('JSX extract', async () => {
    await Effect.gen(function* () {
      const fs = yield* FSUtils.FsUtils;
      const babel = yield* BabelCompilerContext;
      const { inputFile } = yield* getFixture('jsx');
      const code = yield* fs.readFile(inputFile);

      const ast = getBabelAST(code, inputFile);
      babel.transformAstWithSheets;
      const trees = yield* babel
        .extractJSXElementTrees(ast, TWIN_DEFAULT_PLUGIN_CONFIG)
        .pipe(
          Stream.flatMap((tree) =>
            Stream.fromIterable(tree.all()).pipe(
              Stream.map((node) => node.value),
              Stream.tap((node) => {
                if (node.importSource.kind === 'require') {
                  node.importSource;
                }
                return Effect.void;
              }),
            ),
          ),
          Stream.runCollect,
          Effect.map((chunks) => Array.fromIterable(chunks)),
        );

      expect(trees).toBeDefined();
    }).pipe(TestRuntime.runPromise);
  });
});
