import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import { CompletionToken } from '../types';
import { NativeTailwindService } from './createIntellisense';
import { LanguageServiceLogger } from './logger';
import { ParsedCompletionRule, parse } from './parser';

export class NativeTailwindLanguageService implements TemplateLanguageService {
  constructor(
    private _logger: LanguageServiceLogger,
    private _intellisense: NativeTailwindService,
  ) {}
  getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter,
  ): ts.WithMetadata<ts.CompletionInfo> {
    const text = context.text;
    const textOffset = context.toOffset(position);
    const parsedRule = parse(text, textOffset, true);
    return translateCompletionItemsToCompletionInfo(context, {
      isIncomplete: true,
      items: Array.from([
        ...this._intellisense.completions.classes.values(),
        ...this._intellisense.completions.variants.values(),
      ]).map((completion, index) => getCompletionItem(context, completion, parsedRule, index)),
    });
  }
}

function getCompletionItem(
  context: TemplateContext,
  completion: CompletionToken,
  rule: ParsedCompletionRule,
  sortedIndex: number,
): vscode.CompletionItem {
  return {
    kind: getCompletionTokenKind(completion),
    data: completion.kind,
    label:
      rule.prefix && completion.name !== '&' && completion.kind == 'class'
        ? completion.name.slice(rule.prefix.length + 1)
        : completion.name,
    preselect: false,
    filterText: rule.name,
    sortText: sortedIndex.toString().padStart(8, '0'),
    textEdit: {
      newText:
        rule.prefix && completion.name !== '&' && completion.kind == 'class'
          ? completion.name.slice(rule.prefix.length + 1)
          : completion.name,
      range: {
        start: context.toPosition(rule.loc.start),
        end: context.toPosition(rule.loc.end),
      },
    },
  };
}

export function getCompletionTokenKind(completion: CompletionToken) {
  if (completion.kind == 'variant') {
    return vscode.CompletionItemKind.Module;
  }
  if (completion.isColor) return vscode.CompletionItemKind.Color;
  return vscode.CompletionItemKind.Property;
}

// function findCompletion(rule: ParsedCompletionRule, intellisense: IntellisenseService) {
//   for (const completion of intellisense.classes.values()) {
//     const label =
//       rule.prefix &&
//       completion.kind == 'class' &&
//       completion.name.startsWith(rule.prefix + '-')
//         ? completion.name.slice(rule.prefix.length + 1)
//         : completion.name;
//   }
// }

function translateCompletionItemsToCompletionInfo(
  context: TemplateContext,
  items: vscode.CompletionList,
): ts.WithMetadata<ts.CompletionInfo> {
  return {
    metadata: {
      isIncomplete: items.isIncomplete,
    },
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
    entries: items.items.map((x) => translateCompletionEntry(context, x)),
  };
}

function translateCompletionEntry(
  context: TemplateContext,
  item: vscode.CompletionItem,
): ts.CompletionEntry {
  let replacementSpan: ts.TextSpan | undefined;
  if ('range' in item.textEdit!) {
    replacementSpan = {
      start: context.toOffset(item.textEdit.range.start),
      length:
        context.toOffset(item.textEdit.range.end) -
        context.toOffset(item.textEdit.range.start),
    };
  }
  return {
    name: item.label,
    kind: item.kind
      ? translateCompletionItemKind(context.typescript, item.kind)
      : context.typescript.ScriptElementKind.unknown,
    kindModifiers: getKindModifiers(item),
    sortText: item.sortText || item.label,
    insertText: item.textEdit && item.textEdit.newText,
    replacementSpan,
  };
}

function getKindModifiers(item: vscode.CompletionItem): string {
  if (item.kind === vscode.CompletionItemKind.Color) {
    return 'color';
  }

  return '';
}

function translateCompletionItemKind(
  typescript: typeof ts,
  kind: vscode.CompletionItemKind,
): ts.ScriptElementKind {
  switch (kind) {
    case vscode.CompletionItemKind.Module:
      return typescript.ScriptElementKind.moduleElement;
    case vscode.CompletionItemKind.Property:
      return typescript.ScriptElementKind.memberVariableElement;
    case vscode.CompletionItemKind.Unit:
    case vscode.CompletionItemKind.Value:
      return typescript.ScriptElementKind.constElement;
    case vscode.CompletionItemKind.Variable:
      return typescript.ScriptElementKind.variableElement;
    case vscode.CompletionItemKind.Enum:
      return typescript.ScriptElementKind.enumElement;
    case vscode.CompletionItemKind.EnumMember:
      return typescript.ScriptElementKind.enumMemberElement;
    case vscode.CompletionItemKind.Keyword:
      return typescript.ScriptElementKind.keyword;
    case vscode.CompletionItemKind.Constant:
      return typescript.ScriptElementKind.constElement;
    case vscode.CompletionItemKind.Color:
      return typescript.ScriptElementKind.primitiveType;
    case vscode.CompletionItemKind.Reference:
      return typescript.ScriptElementKind.alias;
    case vscode.CompletionItemKind.Snippet:
    case vscode.CompletionItemKind.Text:
      return typescript.ScriptElementKind.string;
    default:
      return typescript.ScriptElementKind.unknown;
  }
}
