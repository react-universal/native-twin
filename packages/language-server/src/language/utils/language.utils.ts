import { TinyColor } from '@ctrl/tinycolor';
import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as vscode from 'vscode-languageserver/node';
import { FinalSheet } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { TemplateNode, TwinDocument } from '../../documents/document.resource';
import { TemplateTokenWithText } from '../../template/template.models';
import { TwinRuleParts, TwinRuleWithCompletion } from '../../types/native-twin.types';
import { TemplateTokenData } from '../language.models';

export const getCompletionTokenKind = ({
  rule,
}: TwinRuleWithCompletion): vscode.CompletionItemKind =>
  rule.themeSection == 'colors'
    ? vscode.CompletionItemKind.Color
    : vscode.CompletionItemKind.Constant;

export const getKindModifiers = (item: TwinRuleParts): string =>
  item.meta.feature === 'colors' || item.themeSection === 'colors' ? 'color' : '';

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
  base: TemplateTokenWithText | null = null,
): TemplateTokenData[] => {
  if (
    item.token.type === 'CLASS_NAME' ||
    item.token.type === 'ARBITRARY' ||
    item.token.type === 'VARIANT_CLASS' ||
    item.token.type === 'VARIANT'
  ) {
    if (base?.token.type === 'CLASS_NAME' && item.token.type === 'CLASS_NAME') {
      return asArray(
        new TemplateTokenData(
          new TemplateTokenWithText(
            item.token,
            `${base.token.value.n}-${item.text}`,
            item.templateStarts,
          ),
          base,
        ),
      );
    }
    return asArray(new TemplateTokenData(item, base));
  }

  if (item.token.type === 'GROUP') {
    const base = item.token.value.base;
    const classNames = item.token.value.content.flatMap((x) =>
      getFlattenTemplateToken(x, base),
    );
    return classNames;
  }

  return [];
};

export const getRangeFromTokensAtPosition = (
  document: TwinDocument,
  nodeAtPosition: TemplateNode,
  templateTokens: TemplateTokenWithText[],
) => {
  return pipe(
    templateTokens,
    ReadonlyArray.map((completion) => {
      return document.getRangeAtPosition(completion, nodeAtPosition.range);
    }),
  );
};

export function getDocumentationMarkdown(sheetEntry: FinalSheet) {
  const result: string[] = [];
  // result.push('***Css Rules*** \n\n');
  // result.push(`${'```css\n'}${data.css}${'\n```'}`);
  // result.push('\n\n');
  // result.push(`***className: ${completion.className}*** \n\n`);
  result.push('#### React Native StyleSheet\n');
  result.push(createJSONMarkdownString(sheetEntry.base));
  // result.push(createDebugHover(completionRule));
  return result.join('\n');
}

const createJSONMarkdownString = <T extends object>(x: T) =>
  ['```json', JSON.stringify(x, null, 2), '```'].join('\n');

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
