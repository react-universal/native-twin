import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as vscode from 'vscode';

export class VSCodeDebugContext extends Ctx.Tag('vscode/VSCodeDebugContext')<
  VSCodeDebugContext,
  vscode.DebugSession
>() {}

export const logger = (name: string) =>
  Logger.replaceScoped(
    Logger.defaultLogger,
    Effect.gen(function* (_) {
      const channel = yield* _(
        Effect.acquireRelease(
          Effect.sync(() => vscode.window.createOutputChannel(name, { log: true })),
          (channel) => Effect.sync(() => channel.dispose()),
        ),
      );
      return Logger.make((options) => {
        const message = Logger.logfmtLogger.log(options);

        switch (options.logLevel) {
          case LogLevel.Trace:
            channel.trace(message);
            return;
          case LogLevel.Debug:
            channel.debug(message);
            return;
          case LogLevel.Warning:
            channel.warn(message);
            return;
          case LogLevel.Error:
          case LogLevel.Fatal:
            channel.error(message);
            return;
          default:
            channel.info(message);
            return;
        }
      });
    }),
  );
