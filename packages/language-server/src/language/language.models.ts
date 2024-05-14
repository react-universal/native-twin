import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as vscode from 'vscode-languageserver-types';
import { TemplateTokenWithText } from '../template/template.models';

interface CompletionItemShape extends vscode.CompletionItem {
  readonly label: string;
  readonly kind: vscode.CompletionItemKind;
  readonly filterText: string;
  readonly sortText: string;
  readonly detail: string | undefined;
  readonly labelDetails: vscode.CompletionItemLabelDetails;
  readonly insertText: string;
  readonly insertTextFormat: vscode.InsertTextFormat;
  readonly textEditText: string;
}
export class VscodeCompletionItem implements CompletionItemShape, Equal.Equal {
  readonly label: string;
  readonly kind: vscode.CompletionItemKind;
  readonly filterText: string;
  readonly sortText: string;
  readonly detail: string | undefined;
  readonly labelDetails: vscode.CompletionItemLabelDetails;
  insertText: string;
  readonly insertTextFormat: vscode.InsertTextFormat;
  readonly textEditText: string;
  constructor(completion: CompletionItemShape) {
    this.label = completion.label;
    this.kind = completion.kind;
    this.filterText = completion.filterText;
    this.sortText = completion.sortText;
    this.detail = completion.detail;
    this.labelDetails = completion.labelDetails;
    this.insertText = completion.insertText;
    this.insertTextFormat = completion.insertTextFormat;
    this.textEditText = completion.textEditText;
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof VscodeCompletionItem && this.label === that.label;
  }

  [Hash.symbol](): number {
    return Hash.string(this.label);
  }
}

export class TemplateTokenData implements Equal.Equal {
  constructor(
    readonly token: TemplateTokenWithText,
    readonly base: TemplateTokenWithText | null,
  ) {}

  [Equal.symbol](that: unknown): boolean {
    return that instanceof TemplateTokenData && this.token.text === that.token.text;
  }

  [Hash.symbol](): number {
    return Hash.string(this.token.text);
  }
}
