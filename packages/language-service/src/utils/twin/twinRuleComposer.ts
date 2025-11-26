import type { TWParsedRule } from '@native-twin/css';
import * as Predicates from '../../internal/TwinParser.internals';
import type { TwinLSPDocument } from '../../models/TwinLSPDocument.model';
import type {
  AnyTwinComposedClass,
  LocatedTokenResult,
  TwinClassNameToken,
  TwinClassNameVariantToken,
  TwinClassVariantToken,
  TwinParsedClasses,
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
  parserResult: TwinParsedClasses,
  document: TwinLSPDocument,
) => {
  const getCompositionRange = (composition: AnyTwinComposedClass) =>
    document.getRangeFor(
      composition.startOffset + composition.parentStarts,
      composition.endOffset + composition.parentStarts,
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

  const getGroupCompositionText = (composition: AnyTwinComposedClass) => {
    return composition.text;
  };

  const getCompositionText = (composition: AnyTwinComposedClass) => {
    if (composition.type === 'ComposedClass') {
      if (composition.token.type === 'CLASS_NAME') {
        return getClassCompositionText(composition.token);
      }
      if (composition.token.type === 'VARIANT') {
        return getVariantCompositionText(composition.token);
      }
      if (composition.token.type === 'VARIANT_CLASS') {
        return getClassNameVariantCompositionText(composition.token);
      }
      if (composition.token.type === 'ARBITRARY') {
        return composition.text;
      }
      if (composition.token.type === 'GROUP') {
        return getGroupCompositionText(composition);
      }
    }
    return composition.text;
  };

  const findComposedClassAtPosition = (offset: number): LocatedTokenResult | null => {
    for (const node of parserResult.composedClasses) {
      if (!Predicates.isComposedNodeAtOffset(node, offset)) continue;

      if (Predicates.isComposedNodeAtOffset(node, offset) && node.type === 'ComposedClass') {
        return {
          endOffset: node.endOffset,
          startOffset: node.startOffset,
          fullLoc: {
            startOffset: node.startOffset + node.parentStarts,
            endOffset: node.parentStarts + node.endOffset,
          },
          group: null,
          lookupText: node.classNameText,
          node: node,
        };
      }

      if (Predicates.isComposedClassGroup(node)) {
        const targetComposition = node.token.composes.find((_) =>
          Predicates.isComposedNodeAtOffset(_, offset),
        );
        if (!targetComposition) return null;

        const base = node.token.base.classNameText;

        let lookupText = '';
        if (node.token.base.token.type === 'CLASS_NAME') {
          lookupText += base;
          if (!base.endsWith('-')) {
            lookupText += '-';
          }
        }
        if (targetComposition.type === 'ComposedClass') {
          lookupText += targetComposition.text;
        }
        return {
          startOffset: node.startOffset,
          endOffset: node.endOffset,
          group: null,
          fullLoc: {
            startOffset: node.startOffset + node.parentStarts,
            endOffset: node.endOffset + node.parentStarts,
          },
          lookupText,
          node: node,
        };
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
