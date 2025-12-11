import type * as vscode from 'vscode';
import {
  JSXParserLive,
  TwinParserContextLive,
  TwinRuntimeContextLive,
  TypescriptUtilsLive,
} from '@native-twin/language-service/browser';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import { launchExtension } from './extension/extension.program';
import { VscodeContext } from './extension/extension.service';
import { CompletionsService } from './language/browser/Completions.service';
import { TypescriptContextLive } from './language/browser/Services';

const MainLive = Layer.empty.pipe(
  Layer.provideMerge(CompletionsService),
  Layer.provideMerge(TypescriptContextLive),
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TypescriptUtilsLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TwinRuntimeContextLive),
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
