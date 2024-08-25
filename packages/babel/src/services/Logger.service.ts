import * as FiberId from 'effect/FiberId';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { inspect } from 'util';

export const BabelLogger = Logger.make((options) => {
  
  const message = inspect({
    message: options.message,
    date: options.date,
    fiberId: FiberId.threadName(options.fiberId),
  }, false, null, true);
  switch (options.logLevel) {
    case LogLevel.Trace:
      console.trace(message);
      return;
    case LogLevel.Debug:
      console.debug(message);
      return;
    case LogLevel.Warning:
      console.warn(message);
      return;
    case LogLevel.Error:
    case LogLevel.Fatal:
      console.error(message);
      return;
    default:
      console.info(message);
      return;
  }
});
