import { TemplateContext } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { CompletionItem } from '../types';
import { createCompletionEntries } from '../utils';

export function getCompletionEntries(
  templateContext: TemplateContext,
  position: ts.LineAndCharacter,
  completionsCache: CompletionItem[],
) {
  let originalList = [...completionsCache];
  const templateClasses = new Set(templateContext.text.split(/\s+/).filter(Boolean));
  const isEmptyCompletion = templateContext.text.charAt(position.character - 1) == ' ';
  const prevText = templateContext.text.slice(0, position.character);
  if (isEmptyCompletion) {
    // Filter insertedClasses
    originalList = originalList.filter((i) => !templateClasses.has(i.name));
  }
  if (prevText == '-') {
    originalList = originalList.filter((x) => x.name.startsWith('-'));
  }
  console.log('PREV: ', prevText);
  if (prevText.endsWith('/')) {
    const prevClasses = prevText.split(/\s+/).filter(Boolean);
    const completion = prevClasses[prevClasses.length - 1]!;
    const util = completionsCache
      .filter((i) => i.name.startsWith('opacity'))
      .map((i) => i.name.split('-')[1]!)
      .sort((a, b) => (parseInt(a) > parseInt(b) ? -1 : 1));
    console.log('UTIL: ', util);
    originalList.push(
      ...util.map(
        (i): CompletionItem => ({
          canBeNegative: false,
          kind: 'class',
          isColor: false,
          theme: null,
          name: `${completion}${i}`,
          index: 0,
          position: 0,
        }),
      ),
    );
  }
  if (prevText.length > 0 && !isEmptyCompletion) {
    const prevClasses = prevText.split(/\s+/).filter(Boolean);
    const completion = prevClasses[prevClasses.length - 1]!;
    originalList = originalList.filter(
      (i) => !templateClasses.has(i.name) && i.name.includes(completion),
    );
  }
  return translateCompletionInfo(templateContext, createCompletionEntries(originalList));
}

const translateCompletionInfo = (
  context: TemplateContext,
  info: ts.CompletionInfo,
): ts.CompletionInfo => {
  return {
    ...info,
    entries: info.entries.map((entry) => translateCompletionEntry(context, entry)),
  };
};

const translateCompletionEntry = (
  context: TemplateContext,
  entry: ts.CompletionEntry,
): ts.CompletionEntry => {
  return {
    ...entry,
    replacementSpan: entry.replacementSpan
      ? translateTextSpan(context, entry.replacementSpan)
      : undefined,
  };
};

const translateTextSpan = (context: TemplateContext, span: ts.TextSpan): ts.TextSpan => {
  return {
    start: context.node.getStart() + 1 + span.start,
    length: span.length,
  };
};
