import * as TwParser from '@native-twin/css/tailwind-parser';
import { flattenObjectByPath } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import type * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import type {
  AnyInternalTwinRule,
  InternalTwFn,
  InternalTwinConfig,
} from '../models/twin/native-twin.types';
import { DEFAULT_RULE_META } from '../utils/constants.utils';
import { composeDeclarations, type StyledContext } from '../utils/sheet.utils';
import * as TwinParserModel from './models/TwinParser.models';
import * as Predicates from './TwinParser.predicates';
import * as TwinUtils from './TwinParser.utils';

export const sanitizeClassName = (themeRule: TwinParserModel.TwinRuleNode, key: string) => {
  const className = themeRule.pattern.endsWith('-')
    ? themeRule.pattern.concat(key)
    : themeRule.pattern.concat('-').concat(key);
  return className.replace(/.*[-]?DEFAULT[-]?/, '');
};

export const getTaggedRule = (rule: AnyInternalTwinRule): TwinParserModel.TwinRuleNode => {
  return typeof rule[1] === 'string'
    ? TwinParserModel.TwinRuleNode.ThemedKey({
        pattern: rule[0],
        meta: rule[3] ?? DEFAULT_RULE_META,
        resolver: rule[2],
        themeSection: rule[1] as Data.TaggedEnum.Value<
          TwinParserModel.TwinRuleNode,
          'ThemedKey'
        >['themeSection'],
      })
    : TwinParserModel.TwinRuleNode.UnKeyed({
        pattern: rule[0],
        meta: rule[3] ?? DEFAULT_RULE_META,
        resolver: rule[2],
      });
};

export const getThemeRules = (config: InternalTwinConfig): TwinParserModel.TwinRuleNode[] => {
  return pipe(
    RA.fromIterable(config.rules),
    RA.flatMap((rule): TwinParserModel.TwinRuleNode[] =>
      pipe(
        RA.fromIterable(rule[0].split('|')),
        RA.map(
          (pattern): TwinParserModel.TwinRuleNode =>
            typeof rule[1] === 'string'
              ? TwinParserModel.TwinRuleNode.ThemedKey({
                  pattern,
                  meta: rule[3] ?? DEFAULT_RULE_META,
                  resolver: rule[2],
                  themeSection: rule[1] as Data.TaggedEnum.Value<
                    TwinParserModel.TwinRuleNode,
                    'ThemedKey'
                  >['themeSection'],
                })
              : TwinParserModel.TwinRuleNode.UnKeyed({
                  pattern,
                  meta: rule[3] ?? DEFAULT_RULE_META,
                  resolver: rule[2],
                }),
        ),
      ),
    ),
  );
};

export const getThemeVariants = (
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

// const getThemeSectionKeys = (config: InternalTwinConfig) => {
//   const keys = [...keysOf(config.theme), ...keysOf(config.theme.extend ?? {})].filter(
//     (x) => x !== 'extend',
//   );
//   return SortedSet.fromIterable(keys, Order.string);
// };

// const getThemeColorPalette = (config: InternalTwinConfig) =>
//   HashMap.fromIterable(Object.entries(config.theme.colors ?? {})).pipe(
//     HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.colors ?? {}))),
//   );

// const getThemeOpacities = (config: InternalTwinConfig) =>
//   pipe(
//     RA.fromIterable(Object.entries(config.theme.opacity ?? {})),
//     RA.union(HashMap.fromIterable(Object.entries(config.theme.extend?.opacity ?? {}))),
//   );

// const getThemeScreenEntries = (config: InternalTwinConfig) =>
//   HashMap.fromIterable(Object.entries(config.theme.screens ?? {})).pipe(
//     HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.screens ?? {}))),
//   );

export const getTwinRuleExpansions = (
  rule: TwinParserModel.TwinRuleNode,
  twin: InternalTwFn,
  styledContext: StyledContext,
): TwinParserModel.ExpandedRule[] => {
  return TwinParserModel.TwinRuleNode.$match(rule, {
    ThemedKey: (themeRule): TwinParserModel.ExpandedRule[] => {
      const flattenSection = flattenObjectByPath(twin.theme(themeRule.themeSection as any));
      return Object.entries(flattenSection).flatMap(([key, value]) => {
        const className = TwinUtils.sanitizeClassName(themeRule, key);
        if (className.endsWith('-')) return [];
        if (className === '') return [];
        return { className, key, value, meta: themeRule.meta };
      });
    },
    UnKeyed: (computedRule): TwinParserModel.ExpandedRule[] => {
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
          TwParser.parseTWTokens(computedRule.pattern)[0],
        );
        if (typeof value === 'object') {
          value = composeDeclarations(value.declarations, styledContext);
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
};

const createComposedClass = (
  token:
    | TwinParserModel.TwinClassNameToken
    | TwinParserModel.TwinClassNameVariantToken
    | TwinParserModel.TwinClassVariantToken
    | TwinParserModel.AnyTwinClassToken,
  info: TwinParserModel.ComposedClassInfo,
): TwinParserModel.TwinComposedClassName => ({ type: 'ComposedClass', token, ...info });

export const createComposedClasses = (
  groupContent: TwinParserModel.AnyTwinClassToken[],
  text: string,
  parentStarts: number,
  results: TwinParserModel.AnyTwinComposedClass[] = [],
): TwinParserModel.AnyTwinComposedClass[] => {
  const nextToken = groupContent.shift();
  if (!nextToken) return results;

  if (Predicates.isAnyTokenExceptGroup(nextToken)) {
    results.push(
      createComposedClass(nextToken, composedClassInfo(nextToken, { text, start: parentStarts })),
    );
    return createComposedClasses(groupContent, text, parentStarts, results);
  }

  if (Predicates.isGroupToken(nextToken)) {
    const newContent = createComposedClasses(
      nextToken.composes,
      text.slice(nextToken.base.start, nextToken.base.end),
      parentStarts,
    ).map((x) => {
      x.text = text.slice(x.loc.start, x.loc.end);
      return x;
    });

    const base = createComposedClass(
      nextToken.base,
      composedClassInfo(nextToken.base, { text, start: parentStarts }),
    );

    results.push({
      type: 'ComposedGroup',
      ...composedClassInfo(nextToken, { start: parentStarts, text }),
      token: {
        base,
        composes: newContent,
      },
    });
  }
  return createComposedClasses(groupContent, text, parentStarts, results);
};

const composedClassInfo = (
  token: TwinParserModel.AnyTwinClassToken,
  fullClass: { text: string; start: number },
) => {
  const tokenText = fullClass.text.slice(token.start, token.end);
  const loc: TwinParserModel.WithLocation = { start: token.start, end: token.end };
  const documentLoc: TwinParserModel.WithLocation = {
    start: token.start + fullClass.start,
    end: token.end + fullClass.start,
  };
  return { text: tokenText, documentLoc, loc, parentStarts: fullClass.start };
};
