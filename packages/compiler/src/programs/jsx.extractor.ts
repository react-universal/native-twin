// import { Effect, Stream } from 'effect';
// import { BabelCompilerContext } from '../Babel';
// import { TWIN_DEFAULT_PLUGIN_CONFIG } from '../shared/compiler.constants';
// import { getBabelAST } from '../utils/babel/babel.utils';

// export const jsxExtractor = (code: string, filename: string) =>
//   Effect.gen(function* () {
//     const babel = yield* BabelCompilerContext;
//     const ast = getBabelAST(code, filename);
//     const trees = yield* babel
//       .extractJSXElementTrees(ast, TWIN_DEFAULT_PLUGIN_CONFIG)
//       .pipe(Stream.runCollect);

//     return trees;
//   });
