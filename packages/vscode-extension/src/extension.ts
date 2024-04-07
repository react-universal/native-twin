import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode';
import { ClientConfigContext } from './client/config/client.config';
import { ServerConfigContext } from './client/config/server.config';
import { logger } from './client/debug/debug.context';
import { LanguageClientContext } from './client/language/language.context';
import { activateExtension, VSCodeContext } from './client/vscode/vscode.context';
import { extensionChannelName } from './internal/config';

const MainLive = Layer.mergeAll(
  Layer.empty.pipe(Layer.provide(logger(extensionChannelName))),
  ClientConfigContext.Live,
  ServerConfigContext.Live,
  LanguageClientContext.Live,
  // ad
);

export function activate(context: vscode.ExtensionContext) {
  activateExtension(MainLive).pipe(
    Effect.provideService(VSCodeContext, context),
    Effect.runFork,
  );
}
