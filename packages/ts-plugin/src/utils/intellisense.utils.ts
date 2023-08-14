import cssbeautify from 'cssbeautify';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import { TinyColor } from '@ctrl/tinycolor';
import type { Suggestion } from '../types';

const collator = new Intl.Collator('en', { numeric: true });

export function getDocumentation(data: Suggestion) {
  const result: string[] = [];
  result.push('***Css Rules*** \n\n');
  result.push(`${'```css\n'}${data.css}${'\n```'}`);
  result.push('\n\n');
  result.push('***React Native StyleSheet*** \n\n');
  result.push(`${'```json\n'}${JSON.stringify(data.sheet, null, 2)}${'\n```'}`);
  return result.join('\n\n');
}

function getKindModifiers(item: string): string {
  if (item.startsWith('rgba')) {
    return 'color';
  }

  return '';
}

export function sortMatcher(a: Suggestion, b: Suggestion): number {
  if (!/^[-a-z\d]/i.test(a.className) && /^[-a-z\d]/i.test(b.className)) {
    return -1;
  }
  if (/^[-a-z\d]/i.test(a.className) && !/^[-a-z\d]/i.test(b.className)) {
    return -1;
  }
  const aInitial = a.className.replace(/^-/, '').split('-', 1)[0]!;
  const bInitial = b.className.replace(/^-/, '').split('-', 1)[0]!;
  const byInitial = collator.compare(compareByName(aInitial), compareByName(bInitial));
  if (byInitial) {
    return byInitial;
  }
  if (a.className.startsWith('-') && !b.className.startsWith('-')) {
    return 1;
  }
  if (!a.className.startsWith('-') && b.className.startsWith('-')) {
    return -1;
  }
  return collator.compare(compareByName(a.className), compareByName(b.className));
}

export function compareByName(s: string) {
  return (s || '').replace(/\W/g, (x) => String.fromCharCode(127 + x.charCodeAt(0))) + '\x00';
}

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

export function getCompletionEntryDetailsDisplayParts(suggestion: Suggestion) {
  if (suggestion.css.includes('rgba')) {
    const declaration = Object.values(suggestion.sheet).join('');
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
  list: Suggestion[],
): ts.WithMetadata<ts.CompletionInfo> {
  const entries = list.map((item): ts.CompletionEntry => {
    return {
      kind: ts.ScriptElementKind.string,
      name: item.className,
      kindModifiers: getKindModifiers(Object.values(item.sheet).join('')),
      sortText: item.className,
    };
  });

  return {
    entries,
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  };
}

export function createCompletionEntryDetails(entry: Suggestion): ts.CompletionEntryDetails {
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
