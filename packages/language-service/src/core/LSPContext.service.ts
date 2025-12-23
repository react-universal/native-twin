import { hasOwnProperty } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as Option from 'effect/Option';
import type * as SubscriptionRef from 'effect/SubscriptionRef';
import type * as server from 'vscode-languageserver';
import type * as Spec from '../internal/LSPAdapterSpec';
import type { TwinLSPAdapterLayerIn } from '../internal/RunnerLayer';
import type { InternalTwinConfig } from '../internal/TwinTypes.internal';
import type { AnyLSPError, Position } from '../models/LSP.models';
import { LSPConstants, type TwinConfigOptions } from '../models/lsp.constants';

export interface TwinLSPCompletionDefinition {
  name: string;
  apply: <E = never, R = never>(
    filename: string,
    position: Position,
  ) => Effect.Effect<
    server.HandlerResult<server.CompletionItem[], void>,
    AnyLSPError | E,
    TwinLSPAdapterLayerIn | Spec.LSPAdapterSpec | R
  >;
}

export function createTwinCompletions(
  definition: TwinLSPCompletionDefinition,
): TwinLSPCompletionDefinition {
  return definition;
}

const configOptionOrDefault = <K extends keyof TwinConfigOptions>(
  options: Partial<TwinConfigOptions>,
  key: K,
): TwinConfigOptions[K] => {
  const value = hasOwnProperty.call(options, key) && options[key];
  if (!value) return LSPConstants.lspRawConfig[key];
  return value;
};

/***** */

// export interface LSPContext {
//   connection: server.Connection;
//   documents: server.TextDocuments<serverDocs.TextDocument>;
//   getDocument: (uri: serverDocs.DocumentUri) => Option.Option<serverDocs.TextDocument>;
//   getAllDocuments: () => Array<serverDocs.TextDocument>;
//   documentChanges: Stream.Stream<serverDocs.TextDocument>;
// }
// export const LSPContext = Context.GenericTag<LSPContext>('lsp/MainContext');

export interface LSPConfig {
  config: SubscriptionRef.SubscriptionRef<TwinConfigOptions>;
  onChangeConfig: (config: TwinConfigOptions) => Effect.Effect<void>;
  configSelector: <T>(selector: (config: TwinConfigOptions) => T) => Effect.Effect<T>;
  loadTwinConfig: (filename: string) => Effect.Effect<Option.Option<InternalTwinConfig>>;
}

export const LSPConfig = Context.GenericTag<LSPConfig>('lsp/LSPConfig');

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
