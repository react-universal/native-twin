import { setup } from '@native-twin/core';
import { flattenObjectByPath } from '@native-twin/helpers';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import * as Trie from 'effect/Trie';
import { DEFAULT_TWIN_CONFIG } from '../utils/constants.utils';
import { requireJS } from '../utils/load-js';
import { createStyledContext } from '../utils/sheet.utils';
import type { InternalTwFn, InternalTwinConfig } from './models/native-twin.types';
import type * as TwinParserModel from './models/TwinParser.models';
import { TwinRuleComposer } from './models/TwinRuleHandler';
import * as TwinUtils from './TwinParser.utils';

const resolvedSections = new Map<string, Record<string, any>>();
const make = Effect.gen(function* () {
  const twinRef = yield* Ref.make<InternalTwFn>(setup(DEFAULT_TWIN_CONFIG));
  const dictionaryRef = yield* SubscriptionRef.make(Trie.empty<TwinParserModel.TwinRuleRegistry>());
  const themeVariants = yield* SubscriptionRef.make<
    HashSet.HashSet<TwinParserModel.TwinVariantNode>
  >(HashSet.empty());
  const ruleComposers = yield* Ref.make(HashMap.empty<string, TwinRuleComposer>());

  const applyToTwin = <T>(cb: (twin: InternalTwFn) => T) =>
    Effect.succeed(cb).pipe(Effect.ap(Ref.get(twinRef)));

  const config = applyToTwin((x) => x.config);
  const themeCtx = applyToTwin((x) => x.context);
  const getConfigRules = applyToTwin((twin) => twin.config.rules);
  const styledContext = applyToTwin((twin) => createStyledContext(twin.config.root.rem));

  const onUpdateConfig = Effect.fn(function* (config: InternalTwinConfig) {
    resolvedSections.clear();
    const twin = yield* Ref.setAndGet(twinRef, setup(config));
    const registry = yield* createRuleCompositions();
    yield* Ref.set(themeVariants, TwinUtils.getThemeVariants(twin.config));
    yield* SubscriptionRef.set(dictionaryRef, registry);
  });

  const resolveThemeSection = (section: keyof InternalTwinConfig['theme']) =>
    applyToTwin((twin) => {
      const cached = resolvedSections.get(section);
      if (cached) return cached;
      resolvedSections.set(section, flattenObjectByPath(twin.theme(section) ?? {}));
      return resolvedSections.get(section)!;
    });

  return {
    resolveThemeSection,
    bootTwinRuntime,
    onUpdateConfig,
    config,
    twinRef,
    themeCtx,
    styledContext,
    dictionaryRef,
    themeVariants,
    getConfigRules,
    ruleComposers,
  };

  function createRuleCompositions() {
    return Stream.fromEffect(twinRef.get).pipe(
      Stream.map((x) => x.config.rules),
      Stream.flattenIterables,
      Stream.flatMap((raw) => composeTwinRule(new TwinRuleComposer(raw))),
      Stream.runFold(Trie.empty<TwinParserModel.TwinRuleRegistry>(), (trie, current) =>
        Trie.insert(trie, current.className, current),
      ),
    );
  }

  function composeTwinRule(
    composer: TwinRuleComposer,
  ): Stream.Stream<TwinParserModel.TwinRuleRegistry> {
    return Stream.fromIterable(composer.compositions).pipe(
      Stream.mapEffect((composition) =>
        resolveThemeSection(composer.themeSection as any).pipe(
          Effect.andThen((themeConfig) =>
            composer.createClassNamesCollection(
              composer.compositions.indexOf(composition),
              themeConfig,
            ),
          ),
        ),
      ),
      Stream.onEnd(Ref.update(ruleComposers, (c) => HashMap.set(c, composer.pattern, composer))),
      Stream.flattenIterables,
    );
  }

  function loadTwin(atPath: string): InternalTwinConfig | null {
    return requireJS(atPath).pipe(Option.getOrElse(() => null));
  }

  function bootTwinRuntime(twinPath: string | null = null) {
    return Effect.gen(function* () {
      let result: InternalTwinConfig | null = null;
      const configPath = yield* twinPath
        ? Effect.succeed(twinPath)
        : Config.string('twinConfigPath').pipe(Config.withDefault(null));
      if (configPath) result = loadTwin(configPath);

      if (!result) {
        return yield* Effect.log('Cant detect native twin config path');
      }
      yield* onUpdateConfig(result);
    });
  }
});

export interface TwinRuntimeContext extends Effect.Effect.Success<typeof make> {}
export const TwinRuntimeContext = Context.GenericTag<TwinRuntimeContext>('TwinRuntimeContext');
export const TwinRuntimeContextLive = Layer.effect(TwinRuntimeContext, make);
