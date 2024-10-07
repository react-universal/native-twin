// import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Scope from 'effect/Scope';
import * as vscode from 'vscode';
import { LanguageClientContext } from '../language/language.service';

export class ExtensionContext extends Context.Tag('vscode/ExtensionCtx')<
  ExtensionContext,
  vscode.ExtensionContext
>() {}

// const mapSection =
//   <Section extends string>(section: Section) =>
//   <Data>(config: Data) => ({
//     section,
//     config,
//   });

export class ExtensionService extends Context.Tag('vscode/ExtensionService')<
  ExtensionService,
  {}
>() {
  static Live = Layer.scoped(
    ExtensionService,
    Effect.gen(function* () {
      yield* LanguageClientContext;

      return {};
    }),
  );
}

export const activateExtension = <E>(
  layer: Layer.Layer<LanguageClientContext, E, ExtensionContext>,
) => {
  return Effect.gen(function* () {
    const context = yield* ExtensionContext;
    const scope = yield* Scope.make();

    context.subscriptions.push({
      dispose: () => Effect.runFork(Scope.close(scope, Exit.void)),
    });

    yield* Layer.buildWithScope(layer, scope);

    // const languageClient = Context.get(mainLayer, LanguageClientContext);

    // return languageClient;
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
