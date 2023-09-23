import { TinyColor } from '@ctrl/tinycolor';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import type { ClassCompletionItem, CompletionItem } from '../types';

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

export function getCompletionEntryDetailsDisplayParts(
  suggestion: ClassCompletionItem,
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

export function createCompletionEntries(
  list: CompletionItem[],
): ts.WithMetadata<ts.CompletionInfo> {
  const entries = list.map((item): ts.CompletionEntry => {
    return {
      kind: ts.ScriptElementKind.string,
      name: item.name,
      kindModifiers: item.kind == 'class' && item.isColor ? 'color' : '',
      sortText: item.name,
      insertText: item.name,
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
