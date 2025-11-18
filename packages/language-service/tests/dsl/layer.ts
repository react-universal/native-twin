import { ConfigProvider, Layer } from 'effect';
import path from 'path';
import { TwinParserContextLive, TwinRuntimeContextLive } from '../../src';
import {
  TwinGraphLive,
  TypescriptApiLive,
  TypescriptUtilsLive,
  withRuntimeConfig,
} from '../../src/TS';
import { createTwinLoggerLayerFor } from '../../src/utils/lsp.logger.service';

const testFolder = path.join(__dirname, '..');
export const TestLayer = TypescriptApiLive.pipe(
  Layer.provideMerge(TwinGraphLive),
  Layer.provide(createTwinLoggerLayerFor('LSP')),
  Layer.provideMerge(TypescriptUtilsLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provide(TwinRuntimeContextLive),
).pipe(
  Layer.provide(
    withRuntimeConfig({
      tsConfigPath: path.join(testFolder, 'fixtures/react/tsconfig.json'),
      twinConfigPath: path.join(testFolder, 'fixtures/react/tailwind.config.ts'),
      debug: true,
      enable: true,
      rootDir: path.join(testFolder, 'fixtures/react'),
    }),
  ),
);
