import type * as vscode from 'vscode';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import { launchExtension } from './extension/extension.program';
import { VscodeContext } from './extension/extension.service';
import { LanguageClientContextBrowser } from './language/browser/LSP.service';
import { TwinVscodeHightLightsProviderLive } from './language/common/DocumentHighLights.service';
import { ClientCustomLogger } from './utils/logger.service';

const MainLive = Layer.mergeAll(LanguageClientContextBrowser.Live).pipe(
  Layer.provide(TwinVscodeHightLightsProviderLive),
  Layer.provide(ClientCustomLogger),
);

export function activate(context: vscode.ExtensionContext) {
  launchExtension(MainLive).pipe(
    Effect.provideService(VscodeContext, context),
    Effect.onError((cause) => Effect.log('ERROR ', Cause.prettyErrors(cause))),
    Effect.withSpan('Launcher', { attributes: { executor: 'vscode' } }),
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.runFork,
  );
}
