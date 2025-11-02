import { Effect } from 'effect';
import path from 'path';
import * as ts from 'ts-morph';
import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { makeTwinGraph } from '../src/typescript/models/TwinDSLDocument';
import { TypescriptApi } from '../src/typescript/TypescriptApi';
import { TestLayer } from './dsl';

describe('twin graph extractor', () => {
  test('test extractor ', async () => {
    await Effect.gen(function* () {
      // yield* Effect.sleep('5 seconds');
      const tsAPI = yield* TypescriptApi;
      const source = tsAPI.compiler.createSourceFile(
        path.join('../src/ads.tsx'),
        `
            const a = () => {
            const [state,dispatch] = useState();
            return (
              <div>
              <div className={'bg-rose-700 bg-blue bg-black text(sm md:gray)'} />
            </div>
            )},
      `,
        { overwrite: true, scriptKind: ts.ScriptKind.TSX },
      );
      console.log('CONFIG: ', tsAPI.compiler.getCompilerOptions());

      const tree = tsAPI.compiler
        .getLanguageService()
        .compilerObject.getNavigationTree(source.getFilePath());
      console.log('III: ', inspect(tree, false, null, true));
      const el = source.getFirstDescendant((x) => x.isKind(ts.SyntaxKind.JsxElement));
      const graph = yield* makeTwinGraph(el!, { followSymbolsDepth: 0 });
      expect(graph).toMatchInlineSnapshot(`
        {
          "_id": "Graph",
          "edgeCount": 0,
          "nodeCount": 0,
          "type": "directed",
        }
      `);
      console.log('MEM: ', ts.ts.sys.getMemoryUsage?.());
      // yield* Effect.sync(() => ts.ts.sys.exit(0))
    }).pipe(Effect.provide(TestLayer), Effect.runPromise);
  }, 10000);
});
