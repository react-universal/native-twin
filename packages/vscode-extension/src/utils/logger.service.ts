import * as vscode from 'vscode';
import { inspect } from 'node:util';
import { Constants } from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import * as Predicate from 'effect/Predicate';

/**
 * @domain `Client`
 * @category Logger
 * @group Services
 */
export const ClientCustomLogger = Logger.replaceScoped(
  Logger.defaultLogger,
  Effect.gen(function* () {
    const channel = yield* Effect.acquireRelease(
      Effect.sync(() =>
        vscode.window.createOutputChannel(Constants.extensionChannelName, { log: true }),
      ),
      (channel) => Effect.sync(() => channel.dispose()),
    );

    return Logger.make((options) => {
      let message = '';
      if (typeof options.message === 'string') {
        message = options.message;
      }
      if (Array.isArray(options.message)) {
        message = options.message.map((x) => inspect(x)).join(' ');
      }
      if (Predicate.isRecord(options.message)) {
        message = inspect(options.message, false, null, false);
      }

      switch (options.logLevel) {
        case LogLevel.Trace:
          return channel.trace(message, options);
        case LogLevel.Debug:
          return channel.debug(message);
        case LogLevel.Warning:
          return channel.warn(message);
        case LogLevel.Error:
        case LogLevel.Fatal:
          return channel.error(message);
        default:
          return channel.info(message);
      }
    });
  }),
);

// export const formatLogMessage = (options: {
//   logLevel: LogLevel.LogLevel;
//   message: any;
// }) => {
//   const msgFactory: Doc.Doc<Ansi.Ansi>[] = [];

//   if (typeof options.message === 'string') {
//     msgFactory.push(
//       Doc.text(options.message).pipe(Doc.annotate(loggerUtils.messageConfig)),
//     );
//   }
//   if (Array.isArray(options.message)) {
//     msgFactory.push(
//       Doc.text(options.message.join(' ')).pipe(Doc.annotate(loggerUtils.messageConfig)),
//     );
//   }

//   const doc = Doc.hsep([
//     Doc.text(`[Twin Language Client]`).pipe(
//       Doc.annotate(loggerUtils.scopeTextConfig),
//       Doc.annotate(loggerUtils.getMessageColor(options.logLevel)),
//     ),
//     // Doc.text(`{${fiberId}}`).pipe(Doc.annotate(fiberText)),
//     ...msgFactory,
//   ]);
//   return loggerUtils.render(doc.pipe(Doc.unAnnotate));
// };
