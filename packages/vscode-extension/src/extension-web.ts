import type * as vscode from 'vscode';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import { launchExtension } from './extension/extension.program';
import { VscodeContext } from './extension/extension.service';
import { LanguageClientContextBrowser } from './language/browser/LSP.service';

const MainLive = LanguageClientContextBrowser.Live;

export function activate(context: vscode.ExtensionContext) {
  launchExtension(MainLive).pipe(
    Effect.provideService(VscodeContext, context),
    Effect.scoped,
    Effect.onError((cause) => Effect.log('ERROR ', Cause.prettyErrors(cause))),
    Effect.withSpan('Launcher', { attributes: { executor: 'vscode' } }),
    Logger.withMinimumLogLevel(LogLevel.All),
    // Effect.forkScoped,
    Effect.runFork,
  );
}
