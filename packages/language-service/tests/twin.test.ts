import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Effect, Iterable, Stream } from 'effect';
import path from 'path';
import { JSXParser } from '../src/core/JSXParser.service';
import type { JSXNode } from '../src/models/TwinDsl.models';
import { twinTSExtract } from '../src/programs/twinExtract.program';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('Twin Typescript API', () => {
  it.effect('Parse JSX Files', () =>
    Effect.gen(function* () {
      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
      const jsxParser = yield* JSXParser;
      const { source, jsxNodes } = yield* twinTSExtract(ComponentPath);

      expect(jsxNodes.length).toBeGreaterThan(0);
      const result = yield* Stream.fromEffect(jsxParser.parseSourceFile(source)).pipe(
        Stream.map((x) => x.jsxDeclarators.flatMap((_) => jsxParser.flatJSXDeclarator(_))),
        Stream.flattenIterables,
        Stream.runFold(
          new Map<string, JSXNode>(),
          (acc, current) => new Map(Iterable.appendAll(acc, current)),
        ),
      );
      expect(result.size).toBeGreaterThan(0);
      const parsed = yield* jsxParser.parseSourceFile(source).pipe(
        // Effect.flatMap(x => x.jsxDeclarators.flatMap(_ => Arr))
        Effect.map(({ jsxDeclarators }) =>
          jsxDeclarators.flatMap((_) => Array.from(jsxParser.flatJSXDeclarator(_).entries())),
        ),
        Effect.map((x) => new Map(x)),
      );

      expect(parsed.size).toBeGreaterThan(0);
    }).pipe(Effect.scoped, Effect.provide(TestLayer)),
  );
});
