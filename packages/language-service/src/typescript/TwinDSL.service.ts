import { setup } from '@native-twin/core';
import { parseTWTokens } from '@native-twin/css';
import { flattenObjectByPath, keysOf } from '@native-twin/helpers';
import defaultConfig from '@native-twin/preset-tailwind/default-config';
import * as RA from 'effect/Array';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import type * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as SortedSet from 'effect/SortedSet';
import * as Stream from 'effect/Stream';
import * as Trie from 'effect/Trie';
import type ts from 'ts-morph';
import type { InternalTwinConfig } from '../models/twin/native-twin.types';
import { DEFAULT_RULE_META } from '../utils/constants.utils';
import { requireJS } from '../utils/load-js';
import { composeDeclarations, createStyledContext } from '../utils/sheet.utils';
import { TwinDslModels } from './TwinDsl.models';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;
  const twinConfigPath = yield* Config.string('twinConfigPath');
  const twinConfig = Option.getOrElse(requireJS(twinConfigPath), () => defaultConfig);
  const twin = setup(twinConfig);
  const twinData = {
    rules: getThemeRules(twin.config),
    variants: getThemeVariants(twin.config),
    themeKeys: getThemeSectionKeys(twinConfig),
    screenVariants: getThemeScreenEntries(twinConfig),
    colors: getThemeColorPalette(twinConfig),
    opacities: getThemeOpacities(twinConfig),
    styledContext: createStyledContext(twinConfig.root.rem),
  };

  const trie = pipe(
    RA.flatMap(twinData.rules, expandRule),
    RA.map((x) => [x.className, x] as const),
    Trie.fromIterable,
  );

  const findRulesByKey = (key: string): TwinDslModels.ExpandedRule[] => {
    if (key.length === 0) return [];
    return Array.from(Trie.valuesWithPrefix(trie, key));
  };

  return {
    parseSourceFile,
    flattenDeclarators,
    findRulesByKey,
    twinData,
    ruleTrie: trie,
  };

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.getStatements()).pipe(
      Stream.filterMap((_) => Option.fromNullable(tsUtils.getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), tsUtils.getTwinJSXNode(jsxElement)),
      ),
      Stream.map(
        ([declarator, jsxNode]): TwinDslModels.NodeJSXDeclarator => ({
          _tag: 'NodeJSXDeclarator',
          binding: declarator,
          filename: sourceFile.getFilePath(),
          identifier: declarator.getText(),
          jsxElement: jsxNode,
          node: declarator,
        }),
      ),
      Stream.runCollect,
      Effect.map(
        (declarations): TwinDslModels.TwinSourceFile => ({
          _tag: 'TwinSourceFile',
          jsxDeclarators: RA.fromIterable(declarations),
          node: sourceFile,
        }),
      ),
    );
  }

  function expandRule(rule: TwinDslModels.TwinRuleNode): TwinDslModels.ExpandedRule[] {
    return TwinDslModels.TwinRuleNode.$match(rule, {
      ThemedKey: (themeRule): TwinDslModels.ExpandedRule[] => {
        const flattenSection = flattenObjectByPath(twin.theme(themeRule.themeSection as any));
        return Object.entries(flattenSection).flatMap(([key, value]) => {
          let className = themeRule.pattern.endsWith('-')
            ? themeRule.pattern.concat(key)
            : themeRule.pattern.concat('-').concat(key);
          className = className.replace(/.*[-]?DEFAULT[-]?/, '');
          if (className.endsWith('-')) return [];
          if (className === '') return [];
          return { className, key, value, meta: themeRule.meta };
        });
      },
      UnKeyed: (computedRule): TwinDslModels.ExpandedRule[] => {
        let value = twin.theme(computedRule.pattern as any);
        if (typeof value === 'object') {
          value = computedRule.resolver(
            {
              base: computedRule.pattern,
              negative: computedRule.meta.canBeNegative,
              segment: { type: 'segment', value: '' },
              suffixes: [],
            },
            twin.context,
            parseTWTokens(computedRule.pattern)[0],
          );
          if (typeof value === 'object') {
            value = composeDeclarations(value.declarations, twinData.styledContext);
          }
        }
        return [
          {
            value,
            className: computedRule.pattern,
            key: computedRule.pattern,
            meta: computedRule.meta,
          },
        ];
      },
    });
  }

  function flattenDeclarators(declarator: TwinDslModels.NodeJSXDeclarator) {
    const rootPath = `${declarator.filename}-${declarator.identifier}`;
    const mapped = new Map(flattenNode(declarator.jsxElement, [rootPath]));
    return mapped;

    function flattenNode(
      node: TwinDslModels.JSXNode,
      currentPath: string[],
    ): [string, TwinDslModels.JSXNode][] {
      const nextPath = [...currentPath, `${node.index}`];
      const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
      return [[nextPath.join('-'), node], ...childs];
    }
  }
});

export interface TwinDSLSvc extends Effect.Effect.Success<typeof make> {}
export const TwinDSLSvc = Context.GenericTag<TwinDSLSvc>('TwinDSLSvc');

export const TwinDSLSvcLive = Layer.effect(TwinDSLSvc, make);

const getThemeRules = (config: InternalTwinConfig): TwinDslModels.TwinRuleNode[] => {
  return pipe(
    RA.fromIterable(config.rules),
    RA.flatMap((rule): TwinDslModels.TwinRuleNode[] =>
      pipe(
        RA.fromIterable(rule[0].split('|')),
        RA.map(
          (pattern): TwinDslModels.TwinRuleNode =>
            typeof rule[1] === 'string'
              ? TwinDslModels.TwinRuleNode.ThemedKey({
                  pattern,
                  meta: rule[3] ?? DEFAULT_RULE_META,
                  resolver: rule[2],
                  themeSection: rule[1] as Data.TaggedEnum.Value<
                    TwinDslModels.TwinRuleNode,
                    'ThemedKey'
                  >['themeSection'],
                })
              : TwinDslModels.TwinRuleNode.UnKeyed({
                  pattern,
                  meta: rule[3] ?? DEFAULT_RULE_META,
                  resolver: rule[2],
                }),
        ),
      ),
    ),
  );
};

const getThemeVariants = (
  config: InternalTwinConfig,
): HashSet.HashSet<TwinDslModels.TwinVariantNode> =>
  HashSet.fromIterable(config.variants).pipe(
    HashSet.map((variant): TwinDslModels.TwinVariantNode => {
      if (typeof variant[1] === 'function') {
        return TwinDslModels.TwinVariantNode.Resolver({ pattern: variant[0], value: variant[1] });
      }
      return TwinDslModels.TwinVariantNode.Literal({ pattern: variant[0], value: variant[1] });
    }),
  );

const getThemeSectionKeys = (config: InternalTwinConfig) => {
  const keys = [...keysOf(config.theme), ...keysOf(config.theme.extend ?? {})].filter(
    (x) => x !== 'extend',
  );
  return SortedSet.fromIterable(keys, Order.string);
};

const getThemeColorPalette = (config: InternalTwinConfig) =>
  HashMap.fromIterable(Object.entries(config.theme.colors ?? {})).pipe(
    HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.colors ?? {}))),
  );

const getThemeOpacities = (config: InternalTwinConfig) =>
  pipe(
    RA.fromIterable(Object.entries(config.theme.opacity ?? {})),
    RA.union(HashMap.fromIterable(Object.entries(config.theme.extend?.opacity ?? {}))),
  );

const getThemeScreenEntries = (config: InternalTwinConfig) =>
  HashMap.fromIterable(Object.entries(config.theme.screens ?? {})).pipe(
    HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.screens ?? {}))),
  );
