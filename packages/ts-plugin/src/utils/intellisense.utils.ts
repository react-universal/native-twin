import { TinyColor } from '@ctrl/tinycolor';
import cssbeautify from 'cssbeautify';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import type { ClassCompletionItem, CompletionItem } from '../types';

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

export function getDocumentation(data: ClassCompletionItem) {
  if (!data.property || !data.themeValue) return '';
  const result: string[] = [];
  // result.push('***Css Rules*** \n\n');
  // result.push(`${'```css\n'}${data.css}${'\n```'}`);
  // result.push('\n\n');
  result.push('***React Native StyleSheet*** \n\n');
  result.push(
    `${'```json\n'}${JSON.stringify(
      {
        [data.property]: data.themeValue,
      },
      null,
      2,
    )}${'\n```'}`,
  );
  return result.join('\n\n');
}

export function getCompletionEntryDetailsDisplayParts(suggestion: ClassCompletionItem) {
  if (suggestion.isColor && suggestion.themeValue) {
    if (suggestion.themeValue.startsWith('rgba')) {
      const hex = new TinyColor(suggestion.themeValue);
      if (hex.isValid) {
        return [
          {
            kind: 'color',
            text: hex.toHexString(),
          },
        ];
      }
    } else {
      return [
        {
          kind: 'color',
          text: suggestion.themeValue,
        },
      ];
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

export function createCompletionEntryDetails(
  item: ClassCompletionItem,
): ts.CompletionEntryDetails {
  const displayParts = getCompletionEntryDetailsDisplayParts(item);
  return {
    name: item.name,
    kind: ts.ScriptElementKind.primitiveType,
    kindModifiers: displayParts.length > 0 ? 'color' : '',
    tags: [],
    displayParts,
    documentation: [
      {
        kind: vscode.MarkupKind.Markdown,
        text: getDocumentation(item),
      },
    ],
  };
}
