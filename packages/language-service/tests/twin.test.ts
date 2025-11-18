import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Effect } from 'effect';
import path from 'path';
import { twinTSExtract } from '../src/programs/twinExtract.program';
import { TypescriptApi } from '../src/TS';
import { runTwinParser, TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('Twin Typescript API', () => {
  it.effect('Parse JSX Files', () =>
    Effect.gen(function* () {
      const tsAPI = yield* TypescriptApi;
      const compiler = tsAPI.tsProject;
      yield* runTwinParser('', 0);
      const outFile = compiler.createSourceFile(
        path.join('../src/out-file.tsx'),
        `
            export View = (...props) => <div {...props} />
            export Text = (...props) => <div {...props} />
          `,
        { overwrite: true },
      );
      compiler.addSourceFileAtPath(outFile.getFilePath());
      const { source, jsxNodes } = yield* twinTSExtract(
        path.join('../src/ads.tsx'),
        `
                  import {View, Text} from './out-file.tsx';
                  const a = () => {
                  const [state,dispatch] = useState();
                  return (
                    <View className="bg-gray shadow-md">
                      <Text className={'bg-rose-700 bg-blue bg-black text(sm md:gray)'} />
                      <View className={\`bg-raw\`}>
                      <Text className={\`bg-raw2222 \${state} raw-3333\`} />
                        <Text className={'bg-rose-700 bg-blue bg-black text(sm md:gray)'} />
                      </View>
                    </View>
                  )}
            `,
      );

      expect(jsxNodes.length).toBeGreaterThan(0);
      const parsed = yield* tsAPI.parseSourceFile(source).pipe(
        Effect.map(({ jsxDeclarators }) =>
          jsxDeclarators.flatMap((_) => Array.from(tsAPI.flattenDeclarators(_).entries())),
        ),
        Effect.map((x) => new Map(x)),
      );
      expect(parsed.size).toBeGreaterThan(0);
    }).pipe(
      Effect.scoped,
      Effect.provide(TestLayer),
    ),
  );
});
