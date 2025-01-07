import { Array, Effect, Stream } from 'effect';
import { describe, it } from 'vitest';
import { BabelCompilerContext, FSUtils } from '../src';
import { TWIN_DEFAULT_PLUGIN_CONFIG } from '../src/shared/compiler.constants';
import { getBabelAST } from '../src/utils/babel/babel.utils';
import { TestRuntime, getFixture } from './test.utils';

describe.only('Babel Compiler', () => {
  it('extract babel paths', async () => {
    await Effect.gen(function* () {
      const fs = yield* FSUtils.FsUtils;
      const { extractJSXElementTrees, jsxElementTreeToSheets, transformAstWithSheets } =
        yield* BabelCompilerContext;
      const { inputFile, writeOutput } = yield* getFixture('twin-compiler');
      const code = yield* fs.readFile(inputFile);
      const ast = yield* Effect.sync(() => getBabelAST(code, inputFile));

      const documentSheets = yield* extractJSXElementTrees(
        ast,
        TWIN_DEFAULT_PLUGIN_CONFIG,
      ).pipe(
        Stream.mapEffect((tree) => jsxElementTreeToSheets(tree, 'ios')),
        Stream.flatMap((tree) => Stream.fromIterable(tree.all().map((x) => x.value))),
        Stream.tap((value) =>
          Effect.log('NODE: ', {
            index: value.element.index,
            id: value.element.id,
            selector: value.selector,
            classnames: value.classNames.join(' '),
            finalClassnames: value.props
              .flatMap((x) => x.entries)
              .map((x) => x.className),
          }),
        ),
        Stream.runCollect,
      );

      const resultCode = transformAstWithSheets(ast, documentSheets);
      yield* writeOutput(resultCode);
    }).pipe(TestRuntime.runPromise);
  });
  // it('Text file tree', async () => {
  //   await Effect.gen(function* () {
  //     const fs = yield* FSUtils.FsUtils;
  //     const { inputFile, writeOutput } = yield* getFixture('twin-compiler');

  //     const code = yield* fs.readFile(inputFile);
  //     const { getTwForPlatform } = yield* TwinNodeContext;
  //     const ctx = yield* getTwForPlatform('ios');

  //     const file = new TwinFileTree(inputFile, code);
  //     const result = yield* file.transformBabelPaths(ctx);

  //     if (Option.isNone(result.output)) {
  //       return expect.fail('Cant compile file', inputFile);
  //     }

  //     const write = yield* writeOutput(result.output.value.code).pipe(
  //       Effect.match({
  //         onFailure: () => false,
  //         onSuccess: () => true,
  //       }),
  //     );
  //     expect(write).toBeTruthy();
  //   }).pipe(Logger.withMinimumLogLevel(LogLevel.All), TestRuntime.runPromise);
  // });
});
