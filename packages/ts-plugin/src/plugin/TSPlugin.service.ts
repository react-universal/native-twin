import { hasOwnProperty } from '@native-twin/helpers';
import {
  DEFAULT_PLUGIN_CONFIG,
  type NativeTwinPluginConfiguration,
} from '@native-twin/language-service';
import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import type ts from 'typescript/lib/tsserverlibrary';
import type {
  InternalTwFn,
  InternalTwinConfig,
  InternalTwinThemeContext,
} from '../native-twin/nativeTwin.config';

interface TSPluginContext {
  readonly plugin: {
    readonly ts: typeof ts;
    readonly info: ts.server.PluginCreateInfo;
    readonly config: NativeTwinPluginConfiguration;
  };
  readonly tailwind: {
    readonly config: InternalTwinConfig;
    readonly tw: InternalTwFn;
    readonly context: InternalTwinThemeContext;
  };
}

type _TypescriptApi = typeof ts;
export interface TypeScriptApi extends _TypescriptApi {}
export const TypeScriptApi = Context.GenericTag<TypeScriptApi>('TypeScriptApi');

type _TypeScriptProgram = ts.Program;
export interface TypeScriptProgram extends _TypeScriptProgram {}
export const TypeScriptProgram = Context.GenericTag<TypeScriptProgram>('TypeScriptProgram');

export const parsePluginConfig = (config: any): NativeTwinPluginConfiguration => {
  return {
    configPath: hasOwnProperty.call(config, 'configPath')
      ? config.configPath
      : DEFAULT_PLUGIN_CONFIG.configPath,
    debug: hasOwnProperty.call(config, 'debug') ? config.debug : DEFAULT_PLUGIN_CONFIG.debug,
    enable: hasOwnProperty.call(config, 'enable') ? config.enable : DEFAULT_PLUGIN_CONFIG.enable,
    functions: hasOwnProperty.call(config, 'functions')
      ? config.functions
      : DEFAULT_PLUGIN_CONFIG.functions,
    jsxAttributes: hasOwnProperty.call(config, 'jsxAttributes')
      ? config.jsxAttributes
      : DEFAULT_PLUGIN_CONFIG.jsxAttributes,
    trace: hasOwnProperty.call(config, 'trace') ? config.trace : DEFAULT_PLUGIN_CONFIG.trace,
  };
};

export interface TypeScriptPluginConfig extends NativeTwinPluginConfiguration {}
export const TypeScriptPluginConfig =
  Context.GenericTag<TypeScriptPluginConfig>('TypeScriptPluginConfig');

export class TSPluginService extends Context.Tag('ts/template')<
  TSPluginService,
  TSPluginContext
>() {}

export const buildTSPluginService = (data: TSPluginContext) =>
  Layer.succeed(TSPluginService, TSPluginService.of(data));
