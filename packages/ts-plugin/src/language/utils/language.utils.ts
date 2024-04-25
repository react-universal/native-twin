import { TinyColor } from '@ctrl/tinycolor';
import ts from 'typescript';
import * as vscode from 'vscode-languageserver-types';
import {
  TwinRuleCompletionWithToken,
  TwinRuleParts,
  TwinRuleWithCompletion,
} from '../../native-twin/nativeTwin.types';
import {
  LocatedGroupTokenWithText,
  TemplateTokenWithText,
} from '../../template/template.types';

export function getCompletionTokenKind({
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

export function getKindModifiers(item: TwinRuleParts): string {
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

export type CompletionPart = Exclude<TemplateTokenWithText, LocatedGroupTokenWithText>;
export const getCompletionParts = (token: TemplateTokenWithText): CompletionPart[] => {
  if (token.type === 'CLASS_NAME') {
    return [token];
  }

  if (token.type === 'ARBITRARY') {
    return [token];
  }
  if (token.type === 'VARIANT') {
    return [token];
  }
  if (token.type === 'VARIANT_CLASS') {
    return [token];
  }
  if (token.type === 'GROUP') {
    const classNames = token.value.content.flatMap((x) => {
      return getCompletionParts(x);
    });
    return classNames;
  }

  return [];
};

export function getDocumentation({ completion, rule }: TwinRuleWithCompletion) {
  if (!rule.property || !completion.declarationValue) return '';
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
  result.push(`***className: ${completion.className}*** \n\n`);
  result.push(`${'```json\n'}${JSON.stringify(prop, null, 2)}${'\n```'}`);
  return result.join('\n\n');
}
