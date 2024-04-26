import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
// import { inspect } from 'util';
import { ConnectionService } from '../connection/connection.service';

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
    const connectionRef = yield* $(ConnectionService);
    const connection = yield* $(connectionRef.connectionRef.get)
    return Logger.make((options) => {
      const logService = connection.console;
      const message = Logger.logfmtLogger.log(options);
      switch (options.logLevel) {
        case LogLevel.Trace:
          connection.tracer.log(message);
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
