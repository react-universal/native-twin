import { __defaultRuleMeta, type RuleMeta } from '@native-twin/core';
import type { CompleteStyle } from '@native-twin/css';
import { hasOwnProperty } from '@native-twin/helpers';
import * as HashSet from 'effect/HashSet';
import * as TwinParserModel from '../models/TwinParser.models';
import type { TwinRuleComposer } from '../models/TwinRuleHandler';
import type {
  AnyInternalTwinRule,
  BuildStyledContext,
  InternalNativeTwinRule,
  InternalTwinConfig,
} from './TwinTypes.internal';

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

  if (isAnyTokenExceptGroup(nextToken)) {
    results.push(
      createComposedClass(nextToken, composedClassInfo(nextToken, { text, start: parentStarts })),
    );
    return createComposedClasses(groupContent, text, parentStarts, results);
  }

  if (isGroupToken(nextToken)) {
    const newContent = createComposedClasses(
      nextToken.composes,
      text.slice(nextToken.base.startOffset, nextToken.base.endOffset),
      parentStarts,
    ).map((x) => {
      x.text = text.slice(x.startOffset, x.endOffset);
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
): TwinParserModel.ComposedClassInfo => {
  const tokenText = fullClass.text.slice(token.startOffset, token.endOffset);
  const variants: string[] = [];
  let classNameText = tokenText;
  // if (token.type === 'VARIANT') {
  //   variants.push(...token.value.map((x) => x.n));
  // }
  if (token.type === 'VARIANT_CLASS') {
    classNameText = token.value[1].value.n;
    variants.push(...token.value[0].value.map((x) => x.n));
  }
  for (const variantText of variants) {
    classNameText = classNameText.replace(`${variantText}:`, '');
  }
  return {
    text: tokenText,
    endOffset: token.endOffset,
    startOffset: token.startOffset,
    parentStarts: fullClass.start,
    variants,
    classNameText,
  };
};

export const getRuleResolverInfo = (
  rawRule: AnyInternalTwinRule,
): {
  styleProperty: InternalNativeTwinRule[1] | keyof CompleteStyle | (string & {});
  themeSection: InternalNativeTwinRule[1] | (string & {});
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

export function createStyledContext(rem: number): BuildStyledContext {
  return {
    colorScheme: 'dark',
    deviceAspectRatio: 1 / 3,
    deviceHeight: 1000,
    deviceWidth: 720,
    orientation: 'portrait',
    resolution: 720,
    fontScale: 1,
    platform: 'web',
    units: {
      rem,
      em: rem,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: 720,
      vmax: 1000,
      vw: 1000,
      vh: 720,
    },
  };
}

export const isTokenType =
  <A extends string>(type: A) =>
  (token: unknown): token is { type: A } => {
    const isUndef = typeof token === 'undefined';
    return !isUndef && hasOwnProperty.call(token, 'type') && (token as any)['type'] === type;
  };

export const isGroupToken = isTokenType('GROUP');
export const isArbitraryToken = isTokenType('ARBITRARY');
export const isClassNameToken = isTokenType('CLASS_NAME');
export const isVariantClassToken = isTokenType('VARIANT_CLASS');
export const isComposedClassName = isTokenType('ComposedClass');
export const isComposedClassGroup = isTokenType('ComposedGroup');

export const isAnyTokenExceptGroup = (x: unknown) =>
  isClassNameToken(x) || isArbitraryToken(x) || isVariantClassToken(x);

export const isComposedNodeAtOffset = (
  node: TwinParserModel.AnyTwinComposedClass,
  documentOffset: number,
) => isOffsetAtLocation(documentOffset, node);

export const isOffsetAtLocation = (offset: number, location: TwinParserModel.WithLocation) =>
  offset >= location.startOffset && offset <= location.endOffset;
