import * as t from 'vscode-languageserver-types';
import type { TwinLSPDocument } from './TwinLSPDocument.model';
import type { ParsedRuleWithLocation, TwinRuleRegistry } from './TwinParser.models';

export class TwinCompletionItem {
  constructor(
    private readonly rule: TwinRuleRegistry,
    private readonly parsedRule: ParsedRuleWithLocation,
    private readonly cursorOffset: number,
    private readonly document: TwinLSPDocument,
  ) {}

  toCompletion(): t.CompletionItem {
    const rule = this.rule;
    const replacementText = this.rule.className.replace(this.parsedRule.fullText, '');
    const insertReplacement = t.TextEdit.insert(
      this.document.positionAt(this.cursorOffset),
      replacementText,
    );
    return {
      label: rule.className,
      kind: this.rule.completionKind,
      detail: this.rule.displayParts?.text ?? '',
      labelDetails: {
        description: rule.declarations.join(','),
      },
      insertText: insertReplacement.newText,
      insertTextFormat: t.InsertTextFormat.PlainText,
      insertTextMode: t.InsertTextMode.adjustIndentation,
      textEdit: insertReplacement,
      textEditText: insertReplacement.newText,
    };
  }
}
