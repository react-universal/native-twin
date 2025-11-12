import { Layer } from 'effect';
import path from 'path';
import {
  createTSConfigLayer,
  TwinDSLSvcLive,
  TwinGraphLive,
  TypescriptApiLive,
  TypescriptUtilsLive,
} from '../../src/TS';
import { TwinParserContextLive } from '../../src/twin/TwinParser.service';
import { createTwinLoggerLayerFor } from '../../src/utils/lsp.logger.service';

const testFolder = path.join(__dirname, '..');
export const TestLayer = TypescriptApiLive.pipe(
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TwinGraphLive),
  Layer.provideMerge(TwinDSLSvcLive),
  Layer.provideMerge(TypescriptUtilsLive),
  Layer.provide(createTwinLoggerLayerFor('LSP')),
  Layer.provide(
    createTSConfigLayer({
      tsConfigPath: path.join(testFolder, 'fixtures/react/tsconfig.json'),
      twinConfigPath: path.join(testFolder, 'fixtures/react/tailwind.config.ts'),
    }),
  ),
);
