import type { TWParsedRule } from '@native-twin/css';
import * as Predicates from '../../internal/TwinParser.internals';
import type { TwinLSPDocument } from '../../models/TwinLSPDocument.model';
import type {
  ParsedRuleWithLocation,
  TwinClassNameToken,
  TwinClassNameVariantToken,
  TwinClassVariantToken,
  TwinParserOutput,
} from '../../models/TwinParser.models';

function parsedRuleToClassName(rule: TWParsedRule): string {
  let modifier = '';
  if (rule.m) {
    modifier = `/${rule.m.value}`;
  }
  return `${[...rule.v, (rule.i ? '!' : '') + rule.n + modifier].join(':')}`;
}

function parsedRuleSetToClassNames(rules: TWParsedRule[]): string {
  return rules.map(parsedRuleToClassName).join(' ');
}

export const createCompositionsComposer = (
  parserResult: TwinParserOutput,
  document: TwinLSPDocument,
) => {
  const getCompositionRange = (composition: ParsedRuleWithLocation) =>
    document.getRangeFor(
      composition.startOffset + parserResult.startOffset,
      composition.endOffset + parserResult.endOffset,
    );

  const getClassCompositionText = (composition: TwinClassNameToken) => {
    return parsedRuleToClassName({ ...composition.value, p: 0, v: [] });
  };

  const getVariantCompositionText = (composition: TwinClassVariantToken) => {
    return parsedRuleSetToClassNames(
      composition.value.map((x) => ({ i: x.i, n: x.n, m: null, p: 0, v: [] })),
    );
  };

  const getClassNameVariantCompositionText = (composition: TwinClassNameVariantToken) => {
    return parsedRuleToClassName({
      v: composition.value[0].value.map((x) => x.n),
      i: composition.value[1].value.i || composition.value[0].value.some((x) => x.i),
      m: composition.value[1].value.m,
      n: composition.value[1].value.n,
      p: 0,
    });
  };

  const getGroupCompositionText = (composition: ParsedRuleWithLocation) => {
    return composition.fullText;
  };

  const getCompositionText = (composition: ParsedRuleWithLocation) => {
    if (composition.raw.type === 'CLASS_NAME') {
      return getClassCompositionText(composition.raw);
    }
    if (composition.raw.type === 'VARIANT') {
      return getVariantCompositionText(composition.raw);
    }
    if (composition.raw.type === 'VARIANT_CLASS') {
      return getClassNameVariantCompositionText(composition.raw);
    }
    if (composition.raw.type === 'ARBITRARY') {
      return composition.fullText;
    }
    if (composition.raw.type === 'GROUP') {
      return getGroupCompositionText(composition);
    }
    return composition.fullText;
  };

  const findComposedClassAtPosition = (offset: number): ParsedRuleWithLocation | null => {
    for (const node of parserResult.result) {
      if (!Predicates.isComposedNodeAtOffset(node, offset)) continue;

      if (
        Predicates.isComposedNodeAtOffset(node, offset) &&
        node.type === 'ParsedRuleWithLocation'
      ) {
        return node;
      }
    }
    return null;
  };

  return {
    parserResult,
    getCompositionRange,
    getCompositionText,
    findComposedClassAtPosition,
  };
};
