import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode';
import { activateExtension, ExtensionContext } from './extension/extension.service';
import { LanguageClientContext } from './language/language.service';
import { ClientCustomLogger } from './utils/logger.service';

const MainLive = Layer.mergeAll(LanguageClientContext.Live).pipe(
  Layer.provide(ClientCustomLogger),
);

export function activate(context: vscode.ExtensionContext) {
  const data = activateExtension(MainLive).pipe(
    Effect.provideService(ExtensionContext, context),
    Effect.runFork,
  );

  return data.pipe(Fiber.await, Effect.runPromise).then((x) =>
    Exit.match({
      onFailure() {
        return {};
      },
      onSuccess(x) {
        return x;
      },
    })(x),
  );
}
