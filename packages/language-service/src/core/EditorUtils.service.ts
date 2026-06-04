import { TinyColor } from '@ctrl/tinycolor';
import type { CssFeature, SheetEntry } from '@native-twin/css';
import toCssFormat from 'cssbeautify';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { css_beautify, js_beautify } from 'js-beautify';
import * as vscode from 'vscode-languageserver-types';
import type { AnyInternalTwinRule } from '../internal/TwinTypes.internal';
import type { StyledContext } from '../models/TwinParser.models';
import { annotatedLayer } from '../utils/effect.utils';
import { SheetUtils, SheetUtilsLive } from './SheetUtils.service';

export const make = Effect.gen(function* () {
  const sheetUtils = yield* SheetUtils;
  const getRNMarkDownParts = (nativeStyles: string) => {
    const result: string[] = [];
    result.push('#### React Native StyleSheet\n\n');
    result.push(['```typescript\n', nativeStyles, '\n```'].join('\n'));
    return result;
  };

  const getDocumentationMarkdown = (sheetEntry: Record<string, any>, css: string) => {
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
    return result.join('\n');
  };

  const getCSSMarkDownParts = (css: string) => {
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

  const getCompletionEntryDetailsDisplayParts = (rule: {
    themeSection: AnyInternalTwinRule[1] | (string & {});
    feature: CssFeature;
    declarationValue: string;
  }) => {
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
  };

  const sheetEntriesToMD = (entries: SheetEntry[], context: StyledContext) => {
    const template: string[] = [];
    template.push('StyleSheet.create(');
    template.push('{');

    for (const current of entries) {
      const nextDecl = sheetUtils.composeDeclarations(current.declarations, context);
      template.push(`"${current.className}": `);
      template.push(JSON.stringify(nextDecl, null, 2));
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

  const getCompletionEntryDetails = (
    item: vscode.CompletionItem,
    css: string,
    sheetEntry: Record<string, string>,
  ): vscode.CompletionItem => ({
    ...item,
    documentation: {
      kind: vscode.MarkupKind.Markdown,
      value: getDocumentationMarkdown(sheetEntry, css),
    },
  });

  return {
    getRNMarkDownParts,
    getDocumentationMarkdown,
    getCompletionEntryDetailsDisplayParts,
    getCSSMarkDownParts,
    sheetEntriesToMD,
    getCompletionEntryDetails,
  };
});

const createJSONMarkdownString = <T extends object>(x: T) =>
  ['```json', JSON.stringify(x, null, 2), '```'].join('\n');

export interface EditorUtils extends Effect.Effect.Success<typeof make> {}
export const EditorUtils = Context.GenericTag<EditorUtils>('lsp/EditorUtils');
export const EditorUtilsLive = Layer.effect(EditorUtils, make).pipe(
  Layer.provide(SheetUtilsLive),
  annotatedLayer('EditorUtils'),
);
