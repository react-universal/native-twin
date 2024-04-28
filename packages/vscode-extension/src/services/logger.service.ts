import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as vscode from 'vscode';
import { extensionChannelName } from './extension/extension.constants';

/**
 * @domain `Client`
 * @category Logger
 * @group Services
 */
export const ClientCustomLogger = Logger.replaceScoped(
  Logger.defaultLogger,
  Effect.gen(function* ($) {
    const channel = yield* $(
      Effect.acquireRelease(
        Effect.sync(() =>
          vscode.window.createOutputChannel(extensionChannelName, { log: true }),
        ),
        (channel) => {
          return Effect.sync(() => {
            channel.clear();
            return channel.dispose();
          });
        },
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
