import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Effect, Graph, Layer } from 'effect';
import path from 'path';
import ts from 'ts-morph';
import { inspect } from 'util';
import { TwinGraph, TypescriptUtils } from '../src/TS';
import { TwinRuntimeContextLive } from '../src/twin/TwinRuntime.service';
import { TypescriptApi } from '../src/typescript/TypescriptApi';
import { runTwinParser, TestLayer } from './dsl';

const configProvider = ConfigProvider.fromJson({
  config: path.join(__dirname, 'fixtures/react', 'tsconfig.json'),
});

describe('twin graph extractor', () => {
  it.effect('test extractor ', () =>
    Effect.gen(function* () {
      const tsAPI = yield* TypescriptApi;
      const tsUtils = yield* TypescriptUtils;
      const graph = yield* TwinGraph;
      const compiler = tsAPI.tsProject;
      yield* runTwinParser('', 0);

      const outFile = compiler.createSourceFile(
        path.join('../src/out-file.tsx'),
        `
      export View = (...props) => <div {...props} />
      export Text = (...props) => <div {...props} />
    `,
        { overwrite: true, scriptKind: ts.ScriptKind.TSX },
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
            )};
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
      // console.log('MEM: ', ts.ts.sys.getMemoryUsage?.());
      // yield* Effect.sync(() => ts.ts.sys.exit(0))
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
      Effect.catchAll((error) => Effect.log(error)),
      Effect.provide(Layer.fresh(TwinRuntimeContextLive)),
      Effect.withConfigProvider(configProvider),
    ),
  );
});
