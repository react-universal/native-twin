import { TinyColor } from '@ctrl/tinycolor';
import cssbeautify from 'cssbeautify';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import type { CompletionItem, GetCssResult } from '../types';

export function formatCss(target: string[]) {
  return cssbeautify(
    target
      .filter((rule) => !/^\s*\*\s*{/.test(rule))
      .join('\n')
      .replace(/([^\\],)(\S)/g, '$1 $2'),
    {
      autosemicolon: true,
      indent: '  ',
      openbrace: 'end-of-line',
    },
  )
    .replace(/TYPESCRIPT_PLUGIN_PLACEHOLDER/g, '<...>')
    .replace(/^(\s*)--typescript_plugin_placeholder:\s*none\s*;$/gm, '$1/* ... */')
    .trim();
}

export function getDocumentation(data: GetCssResult) {
  const result: string[] = [];
  result.push('***Css Rules*** \n\n');
  result.push(`${'```css\n'}${data.css}${'\n```'}`);
  result.push('\n\n');
  result.push('***React Native StyleSheet*** \n\n');
  result.push(
    `${'```json\n'}${JSON.stringify(data.sheet.styles.finalSheet.base, null, 2)}${'\n```'}`,
  );
  return result.join('\n\n');
}

export function getCompletionEntryDetailsDisplayParts(suggestion: GetCssResult) {
  if (suggestion.css.includes('rgba')) {
    const declaration = Object.values(suggestion.sheet.styles.finalSheet.base).join('');
    if (declaration.startsWith('rgba')) {
      const hex = new TinyColor(declaration);
      if (hex.isValid) {
        return [
          {
            kind: 'color',
            text: hex.toHexString(),
          },
        ];
      }
    }
  }
  return [];
}

export function createCompletionEntries(
  list: CompletionItem[],
): ts.WithMetadata<ts.CompletionInfo> {
  const entries = list.map((item): ts.CompletionEntry => {
    return {
      kind: ts.ScriptElementKind.string,
      name: item.name,
      kindModifiers: item.kind == 'class' && item.isColor ? 'color' : '',
      sortText: item.name,
    };
  });

  return {
    entries,
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  };
}

export function createCompletionEntryDetails(entry: GetCssResult): ts.CompletionEntryDetails {
  const displayParts = getCompletionEntryDetailsDisplayParts(entry);
  return {
    name: entry.className,
    kind: ts.ScriptElementKind.primitiveType,
    kindModifiers: displayParts.length > 0 ? 'color' : '',
    tags: [],
    displayParts,
    documentation: [
      {
        kind: vscode.MarkupKind.Markdown,
        text: getDocumentation(entry),
      },
    ],
  };
}
