import { TinyColor } from '@ctrl/tinycolor';
import ts from 'typescript';
import * as vscode from 'vscode-languageserver-types';
import { RuleInfo, TwinRuleWithCompletion } from '../native-twin/nativeTwin.rules';
import { CompletionRuleWithToken } from '../native-twin/nativeTwin.types';

export const completionRuleToEntry = (
  completionRule: CompletionRuleWithToken,
  replacementSpan: ts.TextSpan,
  index: number,
): ts.CompletionEntry => {
  const { ruleInfo: rule } = completionRule;
  return {
    kind: getCompletionTokenKind(completionRule),
    filterText: rule.completion.className,
    kindModifiers: getKindModifiers(rule.twinRule),
    name: rule.completion.className,
    sortText: index.toString().padStart(8, '0'),
    sourceDisplay: getCompletionEntryDetailsDisplayParts({
      completion: rule.completion,
      twinRule: rule.twinRule,
    }),
    replacementSpan,
    insertText: rule.completion.className,
    source: rule.completion.className,
    isRecommended: true,
  };
};

export function getDocumentation({ completion, twinRule }: TwinRuleWithCompletion) {
  if (!twinRule.property || !completion.declarationValue) return '';
  const result: string[] = [];
  // result.push('***Css Rules*** \n\n');
  // result.push(`${'```css\n'}${data.css}${'\n```'}`);
  // result.push('\n\n');
  const prop = completion.declarations.reduce(
    (prev, current) => {
      return {
        [current]: completion.declarationValue,
        ...prev,
      };
    },
    {} as Record<string, any>,
  );
  result.push('***React Native StyleSheet*** \n\n');
  result.push(`${'```json\n'}${JSON.stringify(prop, null, 2)}${'\n```'}`);
  return result.join('\n\n');
}

function getCompletionTokenKind({
  token,
  ruleInfo,
}: CompletionRuleWithToken): ts.ScriptElementKind {
  if (token.type === 'VARIANT' || token.type === 'VARIANT_CLASS') {
    return ts.ScriptElementKind.moduleElement;
  }

  if (ruleInfo.twinRule.themeSection == 'colors') {
    return ts.ScriptElementKind.primitiveType;
  }

  return ts.ScriptElementKind.string;
}

function getKindModifiers(item: RuleInfo): string {
  if (item.meta.feature === 'colors' || item.themeSection === 'colors') {
    return 'color';
  }
  return '';
}

export function getCompletionEntryDetailsDisplayParts({
  twinRule,
  completion,
}: TwinRuleWithCompletion): ts.SymbolDisplayPart[] {
  if (twinRule.meta.feature === 'colors' || twinRule.themeSection === 'colors') {
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
