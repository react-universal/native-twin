import * as t from 'vscode-languageserver-types';
import {
  getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
} from '../utils/language/language.utils';
import type { TwinLSPDocument } from './TwinLSPDocument.model';
import type { ParsedRuleWithLocation, TwinRuleRegistry } from './TwinParser.models';

export function getCompletionItem(
  rule: TwinRuleRegistry,
  locatedToken: ParsedRuleWithLocation,
  cursorOffset: number,
  document: TwinLSPDocument,
) {
  const replaceText = rule.className.replace(locatedToken.fullText, '');
  const insertReplacement = t.TextEdit.insert(document.positionAt(cursorOffset), replaceText);
  const completion = {
    label: rule.className,
    kind: getCompletionTokenKind(rule.info.themeSection),
    detail:
      getCompletionEntryDetailsDisplayParts({
        declarationValue: rule.declarationValue,
        feature: rule.info.meta.feature,
        themeSection: rule.info.themeSection,
      })?.text ?? '',
    labelDetails: {
      description: rule.declarations.join(','),
    },
    insertText: insertReplacement.newText,
    insertTextFormat: t.InsertTextFormat.PlainText,
    insertTextMode: t.InsertTextMode.adjustIndentation,
    textEdit: insertReplacement,
    textEditText: insertReplacement.newText,
  } satisfies t.CompletionItem;
  return completion;
}
