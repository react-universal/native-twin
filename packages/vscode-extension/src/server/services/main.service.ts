/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable @typescript-eslint/no-var-requires */
import { SubscriptionRef } from 'effect';
import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Option from 'effect/Option';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { ConnectionContext } from '../connection/connection.context';
import { getClientCapabilities } from '../connection/connection.handlers';
import { LanguageService } from '../language/language.service';
import { requireJS } from '../utils/load-js';
// import { requireJS } from '../utils/load-js';
import { TwinContext } from './twin.context';

export const startServer = () => {
  return Effect.gen(function* (_) {
    const connection = yield* _(ConnectionContext);
    const service = yield* _(LanguageService);
    const twinContext = yield* _(TwinContext);

    connection.onCompletion((params, token, pr, rp) => {
      return service
        .onComPletion(params, token, pr, rp)
        .pipe(Effect.runSync)
        .pipe(Option.getOrElse(() => []));
    });

    connection.onInitialize((params) => {
      const userConfig = Option.fromNullable(params.initializationOptions?.twinConfigFile)
        .pipe(
          Option.map((x) => {
            return requireJS(x.path);
          }),
        )
        .pipe(
          Option.flatMap((userConfig) => {
            return Option.some(userConfig);
          }),
        );

      Effect.all([
        SubscriptionRef.set(twinContext.tw, userConfig),
        SubscriptionRef.set(
          twinContext.tw,
          Option.some(
            setup(
              userConfig.pipe(
                Option.getOrElse(() => ({
                  content: [''],
                })),
              ),
              createVirtualSheet(),
            ),
          ),
        ),
      ]).pipe(Effect.runSync);

      return getClientCapabilities(params.capabilities).pipe(Effect.runSync);
    });

    // connection.onInitialized((...args) => {
    //   console.log('INITIALIZED: ', args);
    // });

    connection.onDidChangeConfiguration((_params) => {
      // console.log('onDidChangeConfiguration', params);
      // SubscriptionRef.set(config, Option.some(params.settings)).pipe(Effect.runSync);
    });

    connection.listen();
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
