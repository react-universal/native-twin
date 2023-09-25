import { TinyColor } from '@ctrl/tinycolor';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import type { ClassCompletionToken } from '../types';

export function getDocumentation(data: ClassCompletionToken) {
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

export function getCompletionEntryDetailsDisplayParts(
  suggestion: ClassCompletionToken,
): ts.SymbolDisplayPart[] {
  if (suggestion.isColor && suggestion.themeValue) {
    const hex = new TinyColor(suggestion.themeValue);
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
  item: ClassCompletionToken,
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
