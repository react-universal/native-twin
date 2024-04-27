import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode';
import {
  activateExtension,
  ExtensionContext,
} from './client/extension/extension.context';
import { LanguageClientLive } from './client/language/language.provider';
import { ClientCustomLogger } from './client/services/logger.service';

const MainLive = Layer.mergeAll(LanguageClientLive).pipe(
  Layer.provide(ClientCustomLogger),
);

export function activate(context: vscode.ExtensionContext) {
  activateExtension(MainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.runFork,
  );
}
