import { Effect, Exit } from 'effect';
import { CompilerInput } from '../babel.types';
import { BabelCompiler, ReactCompilerService } from '../services';

export const getReactStylesRegistry = (input: CompilerInput) => {
  return Effect.gen(function* () {
    const { getAST, getJSXElementTrees } = yield* BabelCompiler;
    const { getRegistry } = yield* ReactCompilerService;
    return yield* Effect.acquireRelease(
      getAST(input.code, input.filename).pipe(
        Effect.flatMap((x) => getJSXElementTrees(x, input.filename)),
        Effect.flatMap((x) => getRegistry(x, input.filename)),
      ),
      (trees, exit) =>
        Exit.isFailure(exit) ? Effect.succeed(null) : Effect.succeed(trees),
    );
  });
};

export const compileReactCode = (input: CompilerInput) => {
  return Effect.gen(function* () {
    const { getAST, getJSXElementTrees, buildFile } = yield* BabelCompiler;
    const { getRegistry, transformTress } = yield* ReactCompilerService;
    return yield* Effect.acquireRelease(
      getAST(input.code, input.filename).pipe(
        Effect.andThen((ast) =>
          getJSXElementTrees(ast, input.filename).pipe(
            Effect.flatMap((x) => getRegistry(x, input.filename)),
            Effect.flatMap((x) => transformTress(x, input.options.platform)),
            Effect.map(() => ast),
          ),
        ),
        Effect.flatMap((ast) => buildFile(ast)),
      ),
      (trees, exit) =>
        Exit.isFailure(exit) ? Effect.succeed(null) : Effect.succeed(trees),
    );
  });
};
