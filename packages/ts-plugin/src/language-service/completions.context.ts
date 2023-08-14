import { TemplateContext } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { CompletionCacheItem } from '../types';
import { createCompletionEntries } from '../utils';

export function getCompletionEntries(
  templateContext: TemplateContext,
  position: ts.LineAndCharacter,
  completionsCache: CompletionCacheItem[],
) {
  let originalList = [...completionsCache];
  const templateClasses = new Set(templateContext.text.split(/\s+/).filter(Boolean));
  const isEmptyCompletion = templateContext.text.charAt(position.character - 1) == ' ';
  const prevText = templateContext.text.slice(0, position.character);
  if (isEmptyCompletion) {
    // Filter insertedClasses
    originalList = originalList.filter((i) => !templateClasses.has(i.className));
  }
  if (prevText == '-') {
    originalList = originalList
      .filter((x) => x.canBeNegative)
      .map((x) => {
        const className = `-${x.className}`;
        return {
          ...x,
          className,
        };
      });
  }
  if (prevText.length > 0 && !isEmptyCompletion) {
    const prevClasses = prevText.split(/\s+/).filter(Boolean);
    const completion = prevClasses[prevClasses.length - 1]!;
    originalList = originalList.filter(
      (i) => !templateClasses.has(i.className) && i.className.includes(completion),
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
