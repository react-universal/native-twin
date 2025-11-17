import * as HashSet from 'effect/HashSet';
import type { InternalTwinConfig } from './models/native-twin.types';
import * as TwinParserModel from './models/TwinParser.models';
import type { TwinRuleComposer } from './models/TwinRuleHandler';
import * as Predicates from './TwinParser.predicates';

export const sanitizeClassName = (themeRule: TwinRuleComposer, key: string) => {
  const className = themeRule.pattern.endsWith('-')
    ? themeRule.pattern.concat(key)
    : themeRule.pattern.concat('-').concat(key);
  return className.replace(/.*[-]?DEFAULT[-]?/, '');
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
