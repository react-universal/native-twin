import { LSPConfig, LSPContext } from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import { inspect } from 'util';

export const sendDebugLog = <T extends object>(message: string, payload: T) =>
  Effect.logDebug(`${message} \n payload: ${inspect(payload, false, null, true)}`);

/**
 * @domain `Server`
 * @category Logger
 * @group Services
 */
export const LoggerLive = Logger.replaceEffect(
  Logger.jsonLogger,
  Effect.gen(function* () {
    const { connection: Connection } = yield* LSPContext;
    const { configSelector } = yield* LSPConfig;
    const getDebugFlag = () => Effect.runSync(configSelector((x) => x.debug));
    return Logger.make((options) => {
      // const fiberId = FiberId.threadName(options.fiberId);
      const logService = Connection.console;
      const message = Logger.logfmtLogger.log(options);
      // const transport = `LSP - Fiber: ${fiberId} \n ${options.message}`;
      const logLevel = getDebugFlag() ? LogLevel.All : options.logLevel;

      switch (logLevel) {
        case LogLevel.Trace:
          Connection.tracer.log(message);
          return;
        case LogLevel.Debug:
          logService.debug(`${message}`);
          return;
        case LogLevel.Warning:
          logService.warn(message);
          return;
        case LogLevel.Error:
        case LogLevel.Fatal:
          logService.error(message);
          return;
        default:
          logService.info(`${message}`);
          return;
      }
    });
  }),
);
