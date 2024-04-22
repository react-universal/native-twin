import { TinyColor } from '@ctrl/tinycolor';
import ts from 'typescript';
import { TwinRule } from '../intellisense/intellisense.types';
import { TemplateTokenWithText } from '../template/template.types';

export const completionRuleToEntry = (
  rule: TwinRule & { token: TemplateTokenWithText },
  index: number,
): ts.CompletionEntry => {
  return {
    kind: ts.ScriptElementKind.primitiveType,
    filterText: rule.completion.className,
    kindModifiers: getKindModifiers(rule),
    name: rule.completion.className,
    sortText: index.toString().padStart(8, '0'),
    sourceDisplay: getCompletionEntryDetailsDisplayParts(rule),
    // replacementSpan,
    insertText: rule.completion.className,
    source: rule.completion.className,
  };
};

function getKindModifiers(item: TwinRule): string {
  if (item.ruleInfo.meta.feature == 'colors') {
    return 'color';
  }
  return '';
}

export function getCompletionEntryDetailsDisplayParts(
  suggestion: TwinRule,
): ts.SymbolDisplayPart[] {
  if (
    suggestion.ruleInfo.meta.feature === 'colors' ||
    suggestion.ruleInfo.themeSection === 'colors'
  ) {
    const hex = new TinyColor(suggestion.completion.declarationValue);
    if (hex.isValid) {
      return [
        {
          kind: 'color',
          text: hex.toHexString(),
        },
      ];
    }
  }
  return [];
}
