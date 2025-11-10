import { ConfigProvider, Effect, Graph } from 'effect';
import path from 'path';
import ts from 'ts-morph';
import { inspect } from 'util';
import { describe, expect, test } from 'vitest';
import { TwinGraph, TypescriptUtils } from '../src/TS';
import { TypescriptApi } from '../src/typescript/TypescriptApi';
import { TestLayer } from './dsl';

const configProvider = ConfigProvider.fromJson({
  config: path.join(__dirname, 'fixtures/react', 'tsconfig.json'),
});

describe('twin graph extractor', () => {
  test('test extractor ', async () => {
    await Effect.gen(function* () {
      const tsAPI = yield* TypescriptApi;
      const tsUtils = yield* TypescriptUtils;
      const graph = yield* TwinGraph;
      const compiler = tsAPI.tsProject;

      const outFile = compiler.createSourceFile(
        path.join('../src/out-file.tsx'),
        `
      export View = (...props) => <div {...props} />
      export Text = (...props) => <div {...props} />
    `,
        { overwrite: true },
      );
      compiler.addSourceFileAtPath(outFile.getFilePath());
      const source = compiler.createSourceFile(
        path.join('../src/ads.tsx'),
        `
            import {View, Text} from './out-file.tsx';
            const a = () => {
            const [state,dispatch] = useState();
            return (
              <View className="bg-gray">
                <Text className={'bg-rose-700 bg-blue bg-black text(sm md:gray)'} />
                <View className={\`bg-raw\`}>
                <Text className={\`bg-raw2222 \${state} raw-3333\`} />
                  <Text className={'bg-rose-700 bg-blue bg-black text(sm md:gray)'} />
                </View>
              </View>
            )},
      `,
        { overwrite: true, scriptKind: ts.ScriptKind.TSX },
      );
      compiler.addSourceFileAtPath(source.getFilePath());
      const { sourceGraph } = yield* graph.extractSourceFileGraph(source, 0);

      const graphViz = Graph.toGraphViz(sourceGraph, {
        edgeLabel: (x) =>
          inspect(x.relationship, { colors: false, depth: null, breakLength: Infinity }),
        graphName: 'SourceFile',
        nodeLabel: (x) => {
          return inspect(
            {
              ...tsUtils.getNodeDebugDetails(x.node),
              isRoot: x.isRoot,
              props: x.mappedProps.map(({ classProp, styleProp, value }) => ({
                classProp,
                styleProp,
                value: value?.literal,
              })),
            },
            {
              colors: false,
              depth: null,
              breakLength: Infinity,
            },
          );
        },
      });
      // console.debug('GRAPH_VIZ', graphViz);
      yield* Effect.promise(() =>
        expect(graphViz).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', 'base.dot')),
      );
      console.log('MEM: ', ts.ts.sys.getMemoryUsage?.());
      // yield* Effect.sync(() => ts.ts.sys.exit(0))
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchAll((error) => Effect.log(error)),
      Effect.withConfigProvider(configProvider),
      Effect.runPromise,
    );
  }, 10000);
});
