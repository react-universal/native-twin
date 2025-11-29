import { __defaultRuleMeta, type RuleMeta } from '@native-twin/core';
import type { CompleteStyle } from '@native-twin/css';
import * as HashSet from 'effect/HashSet';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import * as TwinParserModel from '../models/TwinParser.models';
import type { TwinRuleComposer } from '../models/TwinRuleHandler';
import type * as LSP from './LSPAdapterSpec';
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

export const fixRegionRanges = (node: LSP.JsxNodeRegion, doc: TextDocument): LSP.JsxNodeRegion => {
  const styledProps: LSP.JsxAttributeRegion[] = [];
  for (const attribute of node.styledProps) {
    const { attributeValue } = attribute;
    const originalText = attributeValue.rawText;
    const parsableText = attributeValue.text;
    const documentText = doc.getText(attributeValue.range);

    const subset = new Set([originalText, parsableText, documentText]);
    if (subset.size === 3) {
      if (attributeValue.text.startsWith('`')) {
        attributeValue.text = attributeValue.text.slice(1);
        attributeValue.range.start.character += 1;
      }
      if (attributeValue.text.endsWith('`')) {
        attributeValue.text = attributeValue.text.slice(0, attributeValue.text.lastIndexOf('`'));
      }
      styledProps.push(attribute);
      continue;
    }
    const starOffset = doc.offsetAt(attributeValue.range.start);
    let counterDif = 0;
    let cursor = 0;
    while (cursor < originalText.length) {
      const parsableChar = parsableText[cursor];
      const char = originalText[cursor + counterDif];
      if (!char) break;
      if (char !== parsableChar) {
        ++counterDif;
      }
      ++cursor;
    }
    const cursorDiff = cursor - parsableText.length;
    const finalStart = doc.positionAt(starOffset + counterDif - cursorDiff);
    const finalEnd = doc.positionAt(starOffset + parsableText.length + counterDif - cursorDiff);

    styledProps.push({
      ...attribute,
      attributeValue: {
        ...attributeValue,
        range: { start: finalStart, end: finalEnd },
      },
    });
  }

  return {
    ...node,
    styledProps,
  };
};
