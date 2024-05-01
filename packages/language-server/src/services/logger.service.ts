import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { Connection } from 'vscode-languageserver';
// import { inspect } from 'util';
import { ConnectionService } from '../connection/connection.service';

export const createCustomLogger = (Connection: Connection) => {
  return Logger.make((options) => {
    const logService = Connection.console;
    const message = Logger.logfmtLogger.log(options);
    switch (options.logLevel) {
      case LogLevel.Trace:
        Connection.tracer.log(message);
        return;
      case LogLevel.Debug:
        logService.debug(message + ' DEBUG WORK');
        return;
      case LogLevel.Warning:
        logService.warn(message);
        return;
      case LogLevel.Error:
      case LogLevel.Fatal:
        logService.error(message);
        return;
      default:
        logService.info(message + ' INFO WORK');
        return;
    }
  });
};
// export const loggerLayer = (connection: Connection) =>
//   Logger.replace(Logger.defaultLogger, createConnectionLogger(connection));

// export const sendDebugLog = <T extends object>(message: string, payload: T) =>
//   Effect.log(`${message} \n payload: ${inspect(payload, false, null, true)}`);

/**
 * @domain `Server`
 * @category Logger
 * @group Services
 */
export const LoggerLive = Logger.replaceEffect(
  Logger.defaultLogger,
  Effect.gen(function* ($) {
    const Connection = yield* $(ConnectionService);
    return Logger.make((options) => {
      const logService = Connection.console;
      const message = Logger.logfmtLogger.log(options);
      switch (options.logLevel) {
        case LogLevel.Trace:
          Connection.tracer.log(message);
          return;
        case LogLevel.Debug:
          logService.debug(message + ' DEBUG WORK');
          return;
        case LogLevel.Warning:
          logService.warn(message);
          return;
        case LogLevel.Error:
        case LogLevel.Fatal:
          logService.error(message);
          return;
        default:
          logService.info(message + ' INFO WORK');
          return;
      }
    });
  }),
);
