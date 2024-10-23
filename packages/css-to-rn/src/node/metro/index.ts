import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { twinFileSystemLayer } from '../file-system';
import { NativeTwinServiceNode } from '../native-twin';
import { twinLoggerLayer } from '../services/Logger.service';
import { getTransformerOptions, twinMetroRequestResolver } from './metro.resolver';
import type {
  BabelTransformerConfig,
  BabelTransformerFn,
  BabelTransformerOptions,
  NativeTwinTransformerOpts,
  TwinMetroTransformFn,
} from './models';
import {
  make as makeMetroConfig,
  MetroWithNativeTwindOptions,
  TwinMetroConfig,
  MetroConfigService,
  createMetroConfig,
} from './services/MetroConfig.service';

const makeMetroLayer = (config: ReturnType<typeof createMetroConfig>) => {
  return twinFileSystemLayer.pipe(
    Layer.provideMerge(makeMetroConfig(config)),
    Layer.provideMerge(
      NativeTwinServiceNode.Live(
        config.userConfig.twinConfigPath,
        config.userConfig.projectRoot,
      ),
    ),
    Layer.provideMerge(twinLoggerLayer),
  );
};

const metroLayerToRuntime = (layer: ReturnType<typeof makeMetroLayer>) =>
  ManagedRuntime.make(layer);

export {
  makeMetroLayer,
  metroLayerToRuntime,
  MetroConfigService,
  getTransformerOptions,
  twinMetroRequestResolver,
  createMetroConfig,
};

export type {
  TwinMetroConfig,
  MetroWithNativeTwindOptions,
  BabelTransformerConfig,
  BabelTransformerFn,
  BabelTransformerOptions,
  NativeTwinTransformerOpts,
  TwinMetroTransformFn,
};
