import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode';
import {
  activateExtension,
  ExtensionContext,
} from './extension/extension.service';
import { LanguageClientContext } from './language/language.service';
import { ClientCustomLogger } from './utils/logger.service';

const MainLive = Layer.mergeAll(LanguageClientContext.Live).pipe(
  Layer.provide(ClientCustomLogger),
);

export function activate(context: vscode.ExtensionContext) {
  activateExtension(MainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.runFork,
  );
}
