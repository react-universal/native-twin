import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import type * as vscode from 'vscode';
import { NativeTwinPluginConfiguration } from '../types/extension.types';

export interface ExtensionClientConfig extends NativeTwinPluginConfiguration {
  tsconfig: Option.Option<vscode.Uri>;
  twinConfigFile: Option.Option<vscode.Uri>;
  workspaceRoot: Option.Option<vscode.WorkspaceFolder>;
}
export class ClientConfigResource {
  get: Effect.Effect<ExtensionClientConfig>;
  // set: Effect.Effect<void>;

  constructor(
    readonly clientConfig: SubscriptionRef.SubscriptionRef<ExtensionClientConfig>,
  ) {
    this.get = SubscriptionRef.get(this.clientConfig);
    // this.set = SubscriptionRef.update(this.clientConfig)
  }

  // set(newConfig: ExtensionClientConfig) {
  //   return SubscriptionRef.update(this.clientConfig, () => newConfig);
  // }

  // subscribe(listener: (x: ExtensionClientConfig) => void) {
  //   return this.clientConfig.changes.pipe(
  //     Stream.changes,
  //     Stream.runCollect,
  //     Effect.map((x) => Chunk.tail(x)),
  //     Effect.tap((x) => Effect.log(x)),
  //     Effect.map(Option.map(Chunk.map((x) => listener(x)))),
  //   );
  // }
}

export const make = Effect.map(
  SubscriptionRef.make({
    tags: ['tw', 'apply', 'css', 'styled', 'variants'],
    attributes: ['tw', 'class', 'className', 'variants'],
    styles: ['style', 'styled'],
    debug: false,
    enable: true,
    trace: {
      server: 'off',
    },
    tsconfig: Option.none(),
    twinConfigFile: Option.none(),
    workspaceRoot: Option.none(),
  } as ExtensionClientConfig),
  (value) => value,
);
