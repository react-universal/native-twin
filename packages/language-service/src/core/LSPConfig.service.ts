import { hasOwnProperty } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as Option from 'effect/Option';
import type * as SubscriptionRef from 'effect/SubscriptionRef';
import type { InternalTwinConfig } from '../internal/TwinTypes.internal';
import { LSPConstants, type TwinConfigOptions } from '../models/lsp.constants';

export interface LSPConfig {
  config: SubscriptionRef.SubscriptionRef<TwinConfigOptions>;
  onChangeConfig: (config: TwinConfigOptions) => Effect.Effect<void>;
  configSelector: <T>(selector: (config: TwinConfigOptions) => T) => Effect.Effect<T>;
  loadTwinConfig: (filename: string) => Effect.Effect<Option.Option<InternalTwinConfig>>;
}
export const LSPConfig = Context.GenericTag<LSPConfig>('lsp/LSPConfig');

const configOptionOrDefault = <K extends keyof TwinConfigOptions>(
  options: Partial<TwinConfigOptions>,
  key: K,
): TwinConfigOptions[K] => {
  const value = hasOwnProperty.call(options, key) && options[key];
  if (!value) return LSPConstants.lspRawConfig[key];
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
    format: configOptionOrDefault(config, 'format'),
    jsxAttributes: configOptionOrDefault(config, 'jsxAttributes'),
    trace: configOptionOrDefault(config, 'trace'),
    completions: configOptionOrDefault(config, 'completions'),
    diagnostics: configOptionOrDefault(config, 'diagnostics'),
  };
};
