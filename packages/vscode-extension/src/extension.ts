import { DevTools } from '@effect/experimental';
import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as vscode from 'vscode';
import { ClientMainLive } from './client';
import { activateExtension, ExtensionContext } from './client/extension/extension.context';
import { LanguageClientLive } from './client/language/language.provider';

export function activate(context: vscode.ExtensionContext) {
  activateExtension(ClientMainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.provide(LanguageClientLive),
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.provide(DevTools.layer()),
    Effect.runFork,
  );
}
