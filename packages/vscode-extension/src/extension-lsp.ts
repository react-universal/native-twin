import { Logger, LogLevel } from 'effect';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode';
import { logger } from './client/debug/debug.context';
import { extensionChannelName } from './client/extension/extension.constants';
import { ExtensionContext } from './client/extension/extension.context';
import { activateExtension } from './client/extension/extension.handlers';
import { LanguageClientLive } from './client/language/language.provider';

const MainLive = Layer.empty.pipe(Layer.provide(logger(extensionChannelName)));

export function activate(context: vscode.ExtensionContext) {
  activateExtension(MainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.provide(LanguageClientLive),
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.runFork,
  );
}
