import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as vscode from 'vscode';
import {
  activateExtension,
  ExtensionContext,
  ExtensionService,
} from './extension/extension.service';
import { LanguageClientContext } from './language/language.service';
import { ClientCustomLogger } from './utils/logger.service';

const MainLive = ExtensionService.Live.pipe(
  Layer.provideMerge(LanguageClientContext.Live),
  Layer.provide(ClientCustomLogger),
  Layer.provideMerge(Logger.pretty),
);

export function activate(context: vscode.ExtensionContext) {
  activateExtension(MainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.runFork,
  );
}
