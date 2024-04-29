import { TinyColor } from '@ctrl/tinycolor';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { CompletionItemKind } from 'vscode-languageserver';
import { FinalSheet } from '@native-twin/css';
import {
  LocatedGroupTokenWithText,
  TemplateTokenWithText,
} from '../../template/template.types';
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

export type CompletionPartShape = Exclude<
  TemplateTokenWithText,
  LocatedGroupTokenWithText
>;

export class CompletionPart implements Equal.Equal {
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly type: TemplateTokenWithText['type'];
  readonly value: TemplateTokenWithText['value'];
  readonly parts: CompletionPartShape;
  constructor(token: CompletionPartShape) {
    this.start = token.start;
    this.end = token.end;
    this.text = token.text;
    this.type = token.type;
    this.value = token.value;
    this.parts = token;
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof CompletionPart && this.parts.text === this.parts.text;
  }

  [Hash.symbol]() {
    return Hash.string(this.parts.text);
  }
}
export const getCompletionParts = (token: TemplateTokenWithText): CompletionPart[] => {
  if (
    token.type === 'CLASS_NAME' ||
    token.type === 'ARBITRARY' ||
    token.type === 'VARIANT_CLASS' ||
    token.type === 'VARIANT'
  ) {
    return [new CompletionPart(token)];
  }

  if (token.type === 'GROUP') {
    const classNames = token.value.content.flatMap((x) => {
      return getCompletionParts(x);
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
