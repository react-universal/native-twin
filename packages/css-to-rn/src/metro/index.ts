import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { twinFileSystemLayer, TwinLogger, NativeTwinServiceNode } from '../node';
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

const make = (config: ReturnType<typeof createMetroConfig>) => {
  return twinFileSystemLayer.pipe(
    Layer.provideMerge(makeMetroConfig(config)),
    Layer.provideMerge(
      NativeTwinServiceNode.Live(
        config.userConfig.twinConfigPath,
        config.userConfig.projectRoot,
      ),
    ),
    Layer.provideMerge(TwinLogger.layer),
  );
};

const toRuntime = (layer: ReturnType<typeof make>) => ManagedRuntime.make(layer);

export {
  make,
  toRuntime,
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
