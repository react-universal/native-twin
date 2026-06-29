import { defineConfig, setup } from '@native-twin/core';
import { flattenObjectByPath } from '@native-twin/helpers';
import * as Array from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Hash from 'effect/Hash';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Ref from 'effect/Ref';
import * as SortedSet from 'effect/SortedSet';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import * as Trie from 'effect/Trie';
import * as LspConfig from '../core/LanguageConfig.service';
import { requireJS } from '../utils/load-config';
import type {
  AnyInternalTwinRule,
  InternalTwFn,
  InternalTwinConfig,
} from './models/native-twin.types';
import type * as TwinParserModel from './models/TwinParser.models';
import { TwinRuleComposer } from './models/TwinRuleHandler';
import * as TwinUtils from './TwinParser.utils';

const resolvedSections = new Map<string, Record<string, any>>();
const make = Effect.gen(function* () {
  const twinRef = yield* Ref.make<InternalTwFn>(setup(defineConfig({ content: [] })));
  const dictionaryRef = yield* SubscriptionRef.make(Trie.empty<TwinParserModel.TwinRuleRegistry>());
  const themeVariants = yield* SubscriptionRef.make<
    HashSet.HashSet<TwinParserModel.TwinVariantNode>
  >(HashSet.empty());
  const composedRules = yield* Ref.make(
    SortedSet.empty<TwinRuleComposer>(
      Order.mapInput(Order.string, (x: TwinRuleComposer) => x.pattern),
    ),
  );
  const ruleComposers = yield* Ref.make(new Map<number, TwinRuleComposer>());

  const applyToTwin = <T>(cb: (twin: InternalTwFn) => T) =>
    Effect.succeed(cb).pipe(Effect.ap(Ref.get(twinRef)));

  const config = applyToTwin((x) => x.config);
  const themeCtx = applyToTwin((x) => x.context);
  const getConfigRules = applyToTwin((twin) => twin.config.rules);
  const styledContext = applyToTwin((twin) => TwinUtils.createStyledContext(twin.config.root.rem));

  const onUpdateConfig = Effect.fn(function* (config: InternalTwinConfig) {
    resolvedSections.clear();
    yield* Ref.set(ruleComposers, new Map());
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
    findRulesByText,
    config,
    twinRef,
    themeCtx,
    styledContext,
    dictionaryRef,
    themeVariants,
    getConfigRules,
    ruleComposers,
  };

  function findRulesByText(text: string) {
    return Stream.fromIterableEffect(composedRules).pipe(
      Stream.map((composer) => composer.evaluateText(text)),
      Stream.flattenIterables,
      Stream.runCollect,
      Effect.map(Array.fromIterable),
    );
  }

  function getOrSetComposer(rawRule: AnyInternalTwinRule) {
    return Effect.gen(function* () {
      const registry = yield* Ref.get(ruleComposers);
      const key = getRawRuleText(rawRule);
      const cached = registry.get(key);
      if (cached) return cached;

      const ruleInfo = TwinUtils.getRuleResolverInfo(rawRule);
      const themeSection = yield* resolveThemeSection(ruleInfo.themeSection as any);
      const composer = new TwinRuleComposer({ rawRule, info: ruleInfo }, themeSection);
      yield* Ref.update(ruleComposers, (x) => x.set(key, composer));
      yield* Ref.update(composedRules, (x) => SortedSet.add(x, composer));
      return composer;
    });
  }

  function createRuleCompositions() {
    return Stream.fromEffect(twinRef.get).pipe(
      Stream.map((x) => x.config.rules),
      Stream.flattenIterables,
      Stream.mapEffect((rawRule) => getOrSetComposer(rawRule)),
      Stream.flatMap((composer) => composeTwinRule(composer)),
      Stream.runFold(Trie.empty<TwinParserModel.TwinRuleRegistry>(), (trie, current) =>
        Trie.insert(trie, current.className, current),
      ),
    );
  }

  function composeTwinRule(
    composer: TwinRuleComposer,
  ): Stream.Stream<TwinParserModel.TwinRuleRegistry> {
    return Stream.fromIterable(composer.toFullRules());
  }

  function loadTwin(atPath: string): InternalTwinConfig | null {
    return requireJS(atPath).pipe(Option.getOrElse(() => null));
  }

  function bootTwinRuntime(twinPath: string | null = null) {
    return Effect.gen(function* () {
      const { twinConfigPath } = yield* LspConfig.TypeScriptPluginConfig;
      let result: InternalTwinConfig | null = null;
      const configPath = yield* twinPath
        ? Effect.succeed(twinPath)
        : Effect.succeed(twinConfigPath);
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

const getRawRuleText = (rawRule: AnyInternalTwinRule) =>
  Hash.string(
    rawRule
      .map((x) => {
        switch (typeof x) {
          case 'string':
          case 'number':
          case 'bigint':
          case 'boolean':
          case 'symbol':
          case 'undefined':
            return `${x}`;
          case 'object':
            return JSON.stringify(x);
          case 'function':
            return '-';
          default:
            return '';
        }
      })
      .join('-'),
  );
