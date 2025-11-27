import { __defaultRuleMeta, type RuleMeta } from '@native-twin/core';
import type { CompleteStyle } from '@native-twin/css';
import { hasOwnProperty } from '@native-twin/helpers';
import * as HashSet from 'effect/HashSet';
import * as TwinParserModel from '../models/TwinParser.models';
import type { TwinRuleComposer } from '../models/TwinRuleHandler';
import type {
  AnyInternalTwinRule,
  BuildStyledContext,
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

export const getRuleResolverInfo = (
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

export const isAnyTokenExceptGroup = (x: unknown) =>
  isClassNameToken(x) || isArbitraryToken(x) || isVariantClassToken(x);

export const isComposedNodeAtOffset = (
  node: TwinParserModel.ParsedRuleWithLocation,
  documentOffset: number,
) => isOffsetAtLocation(documentOffset, node);

export const isOffsetAtLocation = (
  offset: number,
  location: TwinParserModel.ParsedRuleWithLocation,
) => offset >= location.startOffset && offset <= location.endOffset;
