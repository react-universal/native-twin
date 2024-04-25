import { TinyColor } from '@ctrl/tinycolor';
import ts from 'typescript';
import * as vscode from 'vscode-languageserver-types';
import {
  TwinRuleCompletionWithToken,
  TwinRuleParts,
  TwinRuleWithCompletion,
} from '../../native-twin/nativeTwin.types';
import { getDocumentation } from '../utils/documentation';

export const completionRuleToEntry = (
  completionRule: TwinRuleCompletionWithToken,
  replacementSpan: ts.TextSpan,
  index: number,
): ts.CompletionEntry => {
  const { value } = completionRule;
  return {
    kind: getCompletionTokenKind(completionRule),
    filterText: value.completion.className,
    kindModifiers: getKindModifiers(value.rule),
    name: value.completion.className,
    sortText: index.toString().padStart(8, '0'),
    sourceDisplay: getCompletionEntryDetailsDisplayParts({
      completion: value.completion,
      composition: value.composition,
      rule: value.rule,
    }),
    replacementSpan,
    insertText: value.completion.className,
    source: value.completion.className,
    isRecommended: true,
  };
};

function getCompletionTokenKind({
  token,
  value,
}: TwinRuleCompletionWithToken): ts.ScriptElementKind {
  if (token.type === 'VARIANT' || token.type === 'VARIANT_CLASS') {
    return ts.ScriptElementKind.moduleElement;
  }

  if (value.rule.themeSection == 'colors') {
    return ts.ScriptElementKind.primitiveType;
  }

  return ts.ScriptElementKind.string;
}

function getKindModifiers(item: TwinRuleParts): string {
  if (item.meta.feature === 'colors' || item.themeSection === 'colors') {
    return 'color';
  }
  return '';
}

export function getCompletionEntryDetailsDisplayParts({
  rule,
  completion,
}: TwinRuleWithCompletion): ts.SymbolDisplayPart[] {
  if (rule.meta.feature === 'colors' || rule.themeSection === 'colors') {
    const hex = new TinyColor(completion.declarationValue);
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

export function createCompletionEntryDetails(
  item: TwinRuleWithCompletion,
): ts.CompletionEntryDetails {
  const displayParts = getCompletionEntryDetailsDisplayParts(item);
  const documentation = getDocumentation(item);
  return {
    name: item.completion.className,
    kind: ts.ScriptElementKind.string,
    kindModifiers: displayParts.length > 0 ? 'color' : '',
    displayParts,
    documentation: [
      {
        kind: vscode.MarkupKind.Markdown,
        text: documentation,
      },
    ],
  };
}
