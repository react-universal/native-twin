import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode';
import {
  activateExtension,
  ExtensionContext,
} from './services/extension/extension.context';
import { LanguageClientLive } from './services/language/language.provider';
import { ClientCustomLogger } from './services/logger.service';

const MainLive = Layer.mergeAll(LanguageClientLive).pipe(
  Layer.provide(ClientCustomLogger),
);

export function activate(context: vscode.ExtensionContext) {
  activateExtension(MainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.runFork,
  );
}
