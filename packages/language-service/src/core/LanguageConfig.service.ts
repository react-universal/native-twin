import { hasOwnProperty } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as SubscriptionRef from 'effect/SubscriptionRef';
import { DEFAULT_PLUGIN_CONFIG, type TwinConfigOptions } from '../utils/constants.utils';

export interface LSPConfig {
  config: SubscriptionRef.SubscriptionRef<TwinConfigOptions>;
  onChangeConfig: (config: TwinConfigOptions) => Effect.Effect<void>;
  configSelector: <T>(selector: (config: TwinConfigOptions) => T) => Effect.Effect<T>;
}
export const LSPConfig = Context.GenericTag<LSPConfig>('TypeScriptPluginConfig');

const configOptionOrDefault = <K extends keyof TwinConfigOptions>(
  options: Partial<TwinConfigOptions>,
  key: K,
): TwinConfigOptions[K] => {
  const value = hasOwnProperty.call(options, key) && options[key];
  if (!value) return DEFAULT_PLUGIN_CONFIG[key];
  return value;
};

export const parseLSPConfigInput = (config: Partial<TwinConfigOptions>): TwinConfigOptions => {
  return {
    tsConfigPath: configOptionOrDefault(config, 'tsConfigPath'),
    rootDir: configOptionOrDefault(config, 'rootDir'),
    twinConfigPath: configOptionOrDefault(config, 'twinConfigPath'),
    debug: configOptionOrDefault(config, 'debug'),
    enable: configOptionOrDefault(config, 'enable'),
    functions: configOptionOrDefault(config, 'functions'),
    jsxAttributes: configOptionOrDefault(config, 'jsxAttributes'),
    trace: configOptionOrDefault(config, 'trace'),
  };
};
