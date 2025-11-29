import { inspect } from 'node:util';
import { TinyColor } from '@ctrl/tinycolor';
import type { CssFeature, SheetEntry } from '@native-twin/css';
import toCssFormat from 'cssbeautify';
import { css_beautify, js_beautify } from 'js-beautify';
import { CompletionItemKind } from 'vscode-languageserver-types';
import type { AnyInternalTwinRule } from '../../internal/TwinTypes.internal';
import { composeDeclarations, type StyledContext } from '../sheet.utils';

export const getCompletionTokenKind = (
  section: AnyInternalTwinRule[1] | (string & {}),
): CompletionItemKind =>
  section === 'colors' ? CompletionItemKind.Color : CompletionItemKind.Constant;

// export const getKindModifiers = (item: TwinRuleParts): string =>
//   item.meta.feature === 'colors' || item.themeSection === 'colors' ? 'color' : '';

export function getCompletionEntryDetailsDisplayParts(rule: {
  themeSection: AnyInternalTwinRule[1] | (string & {});
  feature: CssFeature;
  declarationValue: string;
}) {
  if (rule.feature === 'colors' || rule.themeSection === 'colors') {
    const hex = new TinyColor(rule.declarationValue);
    if (hex.isValid) {
      return {
        kind: 'color',
        text: hex.toHexString(),
      };
    }
    return {
      kind: 'color',
      text: rule.declarationValue,
    };
  }
  return undefined;
}

export const getCSSMarkDownParts = (css: string) => {
  const result: string[] = [];
  result.push('***Css Rules*** \n\n');
  result.push(
    `${'```css\n'}${css_beautify(css, {
      indent_size: 2,
      indent_level: 0,
      indent_with_tabs: false,
      newline_between_rules: false,
      space_around_combinator: true,
    })}${'\n```'}`,
  );
  result.push('\n\n');
  return result;
};

export const getRNMarkDownParts = (nativeStyles: string) => {
  const result: string[] = [];
  result.push('#### React Native StyleSheet\n\n');
  result.push(['```typescript\n', nativeStyles, '\n```'].join('\n'));
  return result;
};

export function getDocumentationMarkdown(sheetEntry: Record<string, any>, css: string) {
  const result: string[] = [];
  result.push('***Css Rules*** \n\n');
  result.push(
    `${'```css\n'}${toCssFormat(css, {
      indent: '\t',
      openbrace: 'end-of-line',
      autosemicolon: true,
    })}${'\n```'}`,
  );
  result.push('\n\n');
  result.push('#### React Native StyleSheet\n');
  const rnSheet = Object.entries(sheetEntry).filter((x) => Object.keys(x[1]).length > 0);
  result.push(createJSONMarkdownString(Object.fromEntries(rnSheet)));
  // result.push(createDebugHover(completionRule));
  return result.join('\n');
}

const createJSONMarkdownString = <T extends object>(x: T) =>
  ['```json', JSON.stringify(x, null, 2), '```'].join('\n');

export const sheetEntriesToMD = (entries: SheetEntry[], context: StyledContext) => {
  const template: string[] = [];
  template.push('StyleSheet.create(');
  template.push('{');

  for (const current of entries) {
    const nextDecl = composeDeclarations(current.declarations, context);
    template.push(`"${current.className}": `);
    template.push(
      inspect(nextDecl, {
        depth: null,
        compact: false,
        colors: false,
        numericSeparator: true,
        showHidden: false,
      }),
    );
  }
  template.push('});');
  const result = js_beautify(template.join('\n'), {
    brace_style: 'preserve-inline',
    indent_level: 0,
    indent_size: 1,
    indent_with_tabs: false,
    space_in_paren: false,
    comma_first: false,
  });
  return ['#### React Native StyleSheet', '```typescript', result, '\n```'].join('\n');
};

// export function createDebugHover(rule: TwinRuleCompletion) {
//   const result: string[] = [];
//   result.push('********************************************\n');
//   result.push('#### Debug Info');

//   result.push('##### Completion:');
//   result.push(`${'```json\n'}${JSON.stringify(rule.completion, null, 2)}${'\n```'}`);
//   result.push('********************************************\n');

//   result.push('##### Compositions:');
//   result.push(`${'```json\n'}${JSON.stringify(rule.composition, null, 2)}${'\n```'}`);
//   result.push('********************************************\n');

//   result.push('##### Rule:');
//   result.push(`${'```json\n'}${JSON.stringify(rule.rule, null, 2)}${'\n```'}`);
//   result.push('********************************************\n');

//   return result.join('\n\n');
// }
