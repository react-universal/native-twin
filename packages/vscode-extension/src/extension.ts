import type * as vscode from 'vscode';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import { launchExtension } from './extension/extension.program';
import { VscodeContext } from './extension/extension.service';
import { LanguageClientLive } from './language/node/LSP.service';
import { ClientCustomLogger } from './utils/logger.service';

const MainLive = Layer.mergeAll(LanguageClientLive).pipe(
  // Layer.provide(JSXParser.JSXParserLive),
  // Layer.provide(TwinRuntimeContextLive),
  // Layer.provide(TwinVscodeHightLightsProviderLive),
  Layer.provide(ClientCustomLogger),
);

export function activate(context: vscode.ExtensionContext) {
  launchExtension(MainLive).pipe(
    Effect.provideService(VscodeContext, context),
    Effect.scoped,
    Effect.onError((cause) => Effect.log('ERROR ', Cause.prettyErrors(cause))),
    Effect.withSpan('Launcher', { attributes: { executor: 'vscode' } }),
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.runFork,
  );
}
