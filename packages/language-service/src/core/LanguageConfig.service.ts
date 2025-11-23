import { hasOwnProperty } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as SubscriptionRef from 'effect/SubscriptionRef';
import {
  DEFAULT_PLUGIN_CONFIG,
  type TwinConfigOptions,
} from '../utils/constants.utils';

export interface LSPConfig {
  config: SubscriptionRef.SubscriptionRef<TwinConfigOptions>;
  onChangeConfig: (config: TwinConfigOptions) => Effect.Effect<void>;
}
export const LSPConfig = Context.GenericTag<LSPConfig>('TypeScriptPluginConfig');

export const parseLSPConfigInput = (config: any): TwinConfigOptions => {
  return {
    tsConfigPath: hasOwnProperty.call(config, 'tsConfigPath')
      ? config.tsConfigPath
      : DEFAULT_PLUGIN_CONFIG.tsConfigPath,
    rootDir: hasOwnProperty.call(config, 'rootDir')
      ? config.rootDir
      : DEFAULT_PLUGIN_CONFIG.rootDir,
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
