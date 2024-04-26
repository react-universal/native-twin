import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import * as Ref from 'effect/Ref';
import { __Theme__ } from '@native-twin/core';
import { ExtensionClientConfig } from '../connection/client.config';
import { ConnectionService } from '../connection/connection.service';
import * as NativeTwinResource from './nativeTwin.resource';
import { createRuleClassNames, createRuleCompositions } from './nativeTwin.rules';
import { TwinRuleWithCompletion, VariantCompletionToken } from './nativeTwin.types';

export interface TwinStore {
  twinVariants: HashSet.HashSet<VariantCompletionToken>;
  twinRules: HashSet.HashSet<TwinRuleWithCompletion>;
}
export class NativeTwinService extends Context.Tag('plugin/IntellisenseService')<
  NativeTwinService,
  {
    store: Ref.Ref<TwinStore>;
    nativeTwin: NativeTwinResource.NativeTwinHandlerResource;
    onUpdateConfig: (x: ExtensionClientConfig) => void;
  }
>() {}

export const NativeTwinServiceLive = Layer.scoped(
  NativeTwinService,
  Effect.gen(function* ($) {
    const { clientConfigRef } = yield* $(ConnectionService);
    const twin = yield* $(NativeTwinResource.make);
    const nativeTwinHandler = yield* $(twin.get);
    const twinStore = yield* $(Ref.make(createTwinStore(nativeTwinHandler)));

    const updateClientConfig = () => {
      const clientConfig = clientConfigRef.get.pipe(Effect.runSync);
      const newTwin = Ref.setAndGet(
        twin.clientConfig,
        NativeTwinResource.createTwin(
          clientConfig.twinConfigFile.pipe(
            Option.map((x) => x.path),
            Option.getOrUndefined,
          ),
        ),
      ).pipe(Effect.runSync);

      Ref.setAndGet(twinStore, createTwinStore(newTwin)).pipe(Effect.runSync);
    };

    return {
      store: twinStore,
      nativeTwin: twin,
      onUpdateConfig() {
        updateClientConfig();
      },
    };
  }),
);

const createTwinStore = (nativeTwinHandler: NativeTwinResource.NativeTwinHandler) => {
  const theme = { ...nativeTwinHandler.tw.config.theme };
  const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
  themeSections.delete('theme');
  themeSections.delete('extend');
  let nextIndex = 0;
  // let position = 0;
  const currentConfig = nativeTwinHandler.config;
  const variants = Object.entries({
    ...currentConfig.theme.screens,
    ...currentConfig.theme.extend?.screens,
  });
  const colorPalette = {
    ...nativeTwinHandler.context.colors,
    ...nativeTwinHandler.config.theme.extend?.colors,
  };

  const twinRules: HashSet.HashSet<TwinRuleWithCompletion> = pipe(
    ReadonlyArray.fromIterable(nativeTwinHandler.tw.config.rules),
    ReadonlyArray.map((x) => createRuleCompositions(x)),
    ReadonlyArray.flatten,
    ReadonlyArray.map((x) => {
      const values =
        x.parts.themeSection === 'colors'
          ? colorPalette
          : nativeTwinHandler.context.theme(x.parts.themeSection as keyof __Theme__) ??
            {};
      return createRuleClassNames(values, x.composition, x.parts).map(
        (className): TwinRuleWithCompletion => ({
          completion: className,
          composition: x.composition,
          rule: x.parts,
        }),
      );
    }),
    ReadonlyArray.flatten,
    ReadonlyArray.sortBy((x, y) =>
      x.completion.className > y.completion.className ? 1 : -1,
    ),
    HashSet.fromIterable,
  );

  const twinVariants = HashSet.fromIterable(variants).pipe(
    HashSet.map((variant): VariantCompletionToken => {
      return {
        kind: 'variant',
        name: `${variant[0]}:`,
        index: nextIndex++,
        position: nextIndex,
      } as const;
    }),
  );

  return {
    twinRules,
    twinVariants,
  };
};
