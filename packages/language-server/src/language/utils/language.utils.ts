import { TinyColor } from '@ctrl/tinycolor';
import { CompletionItemKind } from 'vscode-languageserver';
import { FinalSheet } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { TemplateTokenWithText } from '../../template/template.models';
import { TwinRuleParts, TwinRuleWithCompletion } from '../../types/native-twin.types';

export function getCompletionTokenKind({
  rule,
}: TwinRuleWithCompletion): CompletionItemKind {
  if (rule.themeSection == 'colors') {
    return CompletionItemKind.Color;
  }

  return CompletionItemKind.Constant;
}

export function getKindModifiers(item: TwinRuleParts): string {
  if (item.meta.feature === 'colors' || item.themeSection === 'colors') {
    return 'color';
  }
  return '';
}

export function getCompletionEntryDetailsDisplayParts({
  rule,
  completion,
}: TwinRuleWithCompletion) {
  if (rule.meta.feature === 'colors' || rule.themeSection === 'colors') {
    const hex = new TinyColor(completion.declarationValue);
    if (hex.isValid) {
      return {
        kind: 'color',
        text: hex.toHexString(),
      };
    }
    return {
      kind: 'color',
      text: completion.declarationValue,
    };
  }
  return undefined;
}

export const getFlattenTemplateToken = (
  item: TemplateTokenWithText,
): TemplateTokenWithText[] => {
  if (
    item.token.type === 'CLASS_NAME' ||
    item.token.type === 'ARBITRARY' ||
    item.token.type === 'VARIANT_CLASS' ||
    item.token.type === 'VARIANT'
  ) {
    return asArray(item);
  }

  if (item.token.type === 'GROUP') {
    const classNames = item.token.value.content.flatMap((x) => {
      return getFlattenTemplateToken(x);
    });
    return classNames;
  }

  return [];
};

export function getDocumentation(sheetEntry: FinalSheet) {
  const result: string[] = [];
  // result.push('***Css Rules*** \n\n');
  // result.push(`${'```css\n'}${data.css}${'\n```'}`);
  // result.push('\n\n');
  // result.push(`***className: ${completion.className}*** \n\n`);
  result.push('***React Native StyleSheet*** \n\n');
  result.push(`${'```json\n'}${JSON.stringify(sheetEntry, null, 2)}${'\n```'}`);
  // result.push(createDebugHover(completionRule));
  return result.join('\n\n');
}

export function createDebugHover(rule: TwinRuleWithCompletion) {
  const result: string[] = [];
  result.push('********************************************\n');
  result.push('#### Debug Info');

  result.push('##### Completion:');
  result.push(`${'```json\n'}${JSON.stringify(rule.completion, null, 2)}${'\n```'}`);
  result.push('********************************************\n');

  result.push('##### Compositions:');
  result.push(`${'```json\n'}${JSON.stringify(rule.composition, null, 2)}${'\n```'}`);
  result.push('********************************************\n');

  result.push('##### Rule:');
  result.push(`${'```json\n'}${JSON.stringify(rule.rule, null, 2)}${'\n```'}`);
  result.push('********************************************\n');

  return result.join('\n\n');
}
