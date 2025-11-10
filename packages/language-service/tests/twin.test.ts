import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Effect, Trie } from 'effect';
import path from 'path';
import ts from 'ts-morph';
import { test } from 'vitest';
import { TwinDSLSvc, TypescriptApi } from '../src/TS';
import { init } from './common';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('suite', () => {
  it.effect('twin parser', () =>
    Effect.gen(function* () {
      const tsAPI = yield* TypescriptApi;
      const compiler = tsAPI.tsProject;
      const dsl = yield* TwinDSLSvc;
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
                  )}
            `,
        { overwrite: true, scriptKind: ts.ScriptKind.TSX },
      );

      const parsed = yield* dsl.parseSourceFile(source).pipe(
        Effect.map(({ jsxDeclarators }) =>
          jsxDeclarators.flatMap((_) => Array.from(dsl.flattenDeclarators(_).entries())),
        ),
        Effect.map((x) => new Map(x)),
      );
      expect(parsed.size).toBeGreaterThan(0);
    }).pipe(Effect.provide(TestLayer)),
  );
  it.effect('twin-dsl', () =>
    Effect.gen(function* () {
      const dsl = yield* TwinDSLSvc;
      const result = dsl.findRulesByKey('bg-red');
      expect(result.length).toBeGreaterThan(0);
      expect(Trie.size(dsl.ruleTrie)).toBeGreaterThan(0);
    }).pipe(Effect.provide(TestLayer)),
  );

  test('test a', async () => {
    const server = await init('react');
    // console.log('asd', server.project);
    expect(1).toBe(1);
    const doc = await server.openDocument({
      text: '<div className="bg-green" />',
      dir: 'react/index.ts',
    });
    // server.client.dispose();
    // console.log(doc);
    await doc.updateSettings({ a: 1 });
    // server.client.dispose()
  }, 10000);
});
