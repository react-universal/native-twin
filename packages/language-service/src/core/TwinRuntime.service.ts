import { __defaultRuleMeta, defineConfig, type RuleMeta, setup } from '@native-twin/core';
import type { CompleteStyle } from '@native-twin/css';
import { flattenObjectByPath } from '@native-twin/helpers';
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
import type {
  AnyInternalTwinRule,
  InternalTwFn,
  InternalTwinConfig,
} from '../internal/TwinTypes.internal';
import * as TwinParserModel from '../models/TwinParser.models';
import { TwinRuleComposer } from '../models/TwinRuleHandler';
import { annotatedLayer } from '../utils/effect.utils';
import * as LspConfig from './LSPConfig.service';
import { SheetUtils, SheetUtilsLive } from './SheetUtils.service';

const resolvedSections = new Map<string, Record<string, any>>();

const make = Effect.gen(function* () {
  const lspConfig = yield* LspConfig.LSPConfig;
  const sheetUtils = yield* SheetUtils;
  const twinRef = yield* Ref.make<InternalTwFn>(setup(defineConfig({ content: [] })));
  const twinTrie = yield* SubscriptionRef.make(Trie.empty<TwinParserModel.TwinRuleRegistry>());
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
  const styledContext = applyToTwin((twin) => sheetUtils.createStyledContext(twin.config.root.rem));

  const onUpdateConfig = Effect.fn(function* (config: InternalTwinConfig) {
    resolvedSections.clear();
    yield* Ref.set(ruleComposers, new Map());
    const twin = yield* Ref.setAndGet(twinRef, setup(config));
    const registry = yield* createRuleCompositions();
    yield* Ref.set(themeVariants, getThemeVariants(twin.config));
    yield* SubscriptionRef.set(twinTrie, registry);
  });

  const resolveThemeSection = (section: keyof InternalTwinConfig['theme']) =>
    applyToTwin((twin) => {
      const cached = resolvedSections.get(section);
      if (cached) return cached;
      resolvedSections.set(section, flattenObjectByPath(twin.theme(section) ?? {}));
      return resolvedSections.get(section)!;
    });

  yield* lspConfig.config.changes.pipe(
    Stream.map((nextConfig) => nextConfig.twinConfigPath),
    Stream.tap(() => Effect.logInfo('TwinConfig refreshed.')),
    Stream.forever,
    Stream.runForEach((twinPath) => bootTwinRuntime(twinPath)),
    Effect.forkDaemon,
  );

  return {
    resolveThemeSection,
    bootTwinRuntime,
    onUpdateConfig,
    config,
    twinRef,
    themeCtx,
    styledContext,
    twinTrie,
    themeVariants,
    getConfigRules,
    ruleComposers,
  };

  function getOrSetComposer(rawRule: AnyInternalTwinRule) {
    return Effect.gen(function* () {
      const registry = yield* Ref.get(ruleComposers);
      const key = getRawRuleText(rawRule);
      const cached = registry.get(key);
      if (cached) return cached;

      const ruleInfo = getRuleResolverInfo(rawRule);
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

  function loadTwin(atPath: string): Effect.Effect<InternalTwinConfig | null> {
    return lspConfig.loadTwinConfig(atPath).pipe(Effect.andThen(Option.getOrElse(() => null)));
  }

  function bootTwinRuntime(twinPath: string) {
    return Effect.gen(function* () {
      const result = yield* loadTwin(twinPath);
      const currentConfig = yield* applyToTwin((x) => x.config);
      if (!result) {
        if (currentConfig.content.length > 0) return yield* Effect.void;
        return yield* Effect.log('Cant detect native twin config path');
      }

      yield* onUpdateConfig(result);
    });
  }
});

export interface TwinRuntimeContext extends Effect.Effect.Success<typeof make> {}
export const TwinRuntimeContext = Context.GenericTag<TwinRuntimeContext>('TwinRuntimeContext');
export const TwinRuntimeContextLive = Layer.effect(TwinRuntimeContext, make).pipe(
  Layer.provide(SheetUtilsLive),
  annotatedLayer('TwinRuntime'),
);

// const sanitizeClassName = (themeRule: TwinRuleComposer, key: string) => {
//   const className = themeRule.pattern.endsWith('-')
//     ? themeRule.pattern.concat(key)
//     : themeRule.pattern.concat('-').concat(key);
//   return className.replace(/.*[-]?DEFAULT[-]?/, '');
// };

const getThemeVariants = (
  config: InternalTwinConfig,
): HashSet.HashSet<TwinParserModel.TwinVariantNode> =>
  HashSet.fromIterable(config.variants).pipe(
    HashSet.map((variant): TwinParserModel.TwinVariantNode => {
      if (typeof variant[1] === 'function') {
        return TwinParserModel.TwinVariantNode.Resolver({ pattern: variant[0], value: variant[1] });
      }
      return TwinParserModel.TwinVariantNode.Literal({ pattern: variant[0], value: variant[1] });
    }),
  );

const getRuleResolverInfo = (
  rawRule: AnyInternalTwinRule,
): {
  styleProperty: AnyInternalTwinRule[1] | keyof CompleteStyle | (string & {});
  themeSection: AnyInternalTwinRule[1] | (string & {});
  meta: RuleMeta;
} => {
  const meta = rawRule[3] ?? __defaultRuleMeta;
  if (meta.styleProperty) {
    return { themeSection: rawRule[1], styleProperty: meta.styleProperty, meta };
  } else if (meta.prefix && meta.prefix !== '') {
    return { themeSection: rawRule[1], styleProperty: meta.prefix, meta };
  }
  return { themeSection: rawRule[1], styleProperty: rawRule[1], meta };
};

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
