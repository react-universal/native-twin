import { TemplateContext } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { CompletionToken } from '../types';
import { NativeTailwindIntellisense } from './createIntellisense';
import { ParsedCompletionRule, parse } from './parser';

export function getCompletionsAtPosition(
  context: TemplateContext,
  position: ts.LineAndCharacter,
  intellisense: NativeTailwindIntellisense,
): ts.WithMetadata<ts.CompletionInfo> {
  const text = context.text;
  const textOffset = context.toOffset(position);
  const parsedRule = parse(text, textOffset, true);
  return {
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
    entries: getCompletionEntries(context, parsedRule, intellisense),
  };
}

function getCompletionEntries(
  context: TemplateContext,
  rule: ParsedCompletionRule,
  intellisense: NativeTailwindIntellisense,
): ts.CompletionEntry[] {
  const result: ts.CompletionEntry[] = [];
  const { completions } = intellisense;
  const hasScreenValue = rule.variants.some((x) => completions.screens.has(x.value));
  const screens = hasScreenValue ? [] : Array.from(completions.variants.values());
  let index = screens.length;
  if (!hasScreenValue && rule.raw == '') {
    screens.forEach((x, i) => {
      result.push({
        kind: ts.ScriptElementKind.alias,
        name: x.name,
        sortText: i.toString().padStart(8, '0'),
        kindModifiers: getCompletionTokenKind(x),
        labelDetails: { description: 'Screen Media Query', detail: 'Screens' },
      });
    });
  }
  for (const token of completions.classes.values()) {
    const nextToken = createCompletionEntry(context, rule, token, index);
    if (!nextToken) continue;
    result.push(nextToken);
    index++;
  }
  return result;
}

function createCompletionEntry(
  context: TemplateContext,
  rule: ParsedCompletionRule,
  completion: CompletionToken,
  sortedIndex: number,
): ts.CompletionEntry | null {
  let name = completion.name;
  let insertText: string | undefined;
  let replacementSpan: ts.TextSpan | undefined = {
    start: context.toOffset(context.toPosition(rule.loc.start)),
    length:
      context.toOffset(context.toPosition(rule.loc.end)) -
      context.toOffset(context.toPosition(rule.loc.start)),
  };
  if (rule.prefix != '') {
    if (name.startsWith(rule.name)) {
      name = completion.name.slice(rule.prefix.length);
      replacementSpan = undefined;
      if (name.startsWith('-')) {
        name = name.slice(1);
      }
    } else {
      return null;
    }
  }
  if (rule.prefix == '') {
    if ((rule.name != '' || rule.raw != '') && !completion.name.startsWith(rule.name)) {
      return null;
    }
    replacementSpan = undefined;
    // insertText = completion.name.slice(rule.raw.length);
    name = completion.name;
  }
  return {
    kind: getCompletionTokenKind(completion),
    kindModifiers: getKindModifiers(completion),
    name,

    sortText: sortedIndex.toString().padStart(8, '0'),
    insertText,
    replacementSpan,
  };
}

export function getCompletionTokenKind(completion: CompletionToken): ts.ScriptElementKind {
  if (completion.kind == 'variant') {
    return ts.ScriptElementKind.moduleElement;
  }
  if (completion.isColor) return ts.ScriptElementKind.primitiveType;
  return ts.ScriptElementKind.string;
}

function getKindModifiers(item: CompletionToken): string {
  if (item.kind == 'variant') return '';
  if (item.isColor) {
    return 'color';
  }

  return '';
}
