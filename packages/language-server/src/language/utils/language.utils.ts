// import { TinyColor } from '@ctrl/tinycolor';
import { TinyColor } from '@ctrl/tinycolor';
import { CompletionItemKind } from 'vscode-languageserver';
import { FinalSheet } from '@native-twin/css';
import {
  TwinRuleParts,
  TwinRuleWithCompletion,
} from '../../native-twin/native-twin.types';
import {
  LocatedGroupTokenWithText,
  TemplateTokenWithText,
} from '../../template/template.types';

export function getCompletionTokenKind({
  rule,
}: TwinRuleWithCompletion): CompletionItemKind {
  if (rule.themeSection == 'colors') {
    return CompletionItemKind.Color;
  }

  // if (token.type === 'VARIANT' || token.type === 'VARIANT_CLASS') {
  //   return CompletionItemKind.Constant;
  // }

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

// export function createCompletionEntryDetails(
//   item: TwinRuleWithCompletion,
// ): ts.CompletionEntryDetails {
//   const displayParts = getCompletionEntryDetailsDisplayParts(item);
//   // const documentation = getDocumentation(item);
//   return {
//     name: item.completion.className,
//     kind: ts.ScriptElementKind.constElement,
//     kindModifiers: item.rule.themeSection === 'colors' ? 'color' : 'text',
//     sourceDisplay: [
//       {
//         kind: item.rule.themeSection === 'colors' ? 'color' : 'text',
//         text: item.completion.className,
//       },
//     ],
//     displayParts,
//     // documentation: [
//     //   {
//     //     kind: vscode.MarkupKind.Markdown,
//     //     text: documentation,
//     //   },
//     // ],
//   };
// }

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

export function getDocumentation(
  completionRule: TwinRuleWithCompletion,
  sheetEntry: FinalSheet,
) {
  const { completion, rule } = completionRule;
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
  result.push(`${'```json\n'}${JSON.stringify(sheetEntry, null, 2)}${'\n```'}`);
  result.push(createDebugHover(completionRule));
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
