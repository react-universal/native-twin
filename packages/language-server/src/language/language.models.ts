import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as vscode from 'vscode-languageserver-types';
import { TemplateTokenWithText } from '../template/template.models';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../types/native-twin.types';
import {
  getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
} from './utils/language.utils';

export class VscodeCompletionItem implements vscode.CompletionItem, Equal.Equal {
  readonly label: string;
  readonly kind: vscode.CompletionItemKind;
  readonly filterText: string;
  readonly sortText: string;
  readonly detail: string | undefined;
  readonly labelDetails: vscode.CompletionItemLabelDetails;
  insertText: string;
  readonly insertTextFormat: vscode.InsertTextFormat;
  readonly textEditText: string;
  readonly textEdit: vscode.TextEdit;

  constructor(
    data: TwinRuleWithCompletion | TwinVariantCompletion,
    range: vscode.Range,
    insertText: string,
  ) {
    if (data.kind === 'rule') {
      const { completion, order } = data;
      this.label = completion.className;
      this.kind = getCompletionTokenKind(data);
      this.filterText = completion.className;
      this.sortText = order.toString().padStart(8, '0');
      this.detail = getCompletionEntryDetailsDisplayParts(data)?.text;
      this.labelDetails = {
        description: completion.declarations.join(','),
      };
      this.insertText = insertText;
      this.insertTextFormat = 2;
      this.textEditText = completion.className;
      this.textEdit = {
        newText: insertText,
        range,
      };
    } else {
      const { name, index } = data;
      this.kind = vscode.CompletionItemKind.Constant;
      this.filterText = name;
      this.label = name;
      this.sortText = index.toString().padStart(8, '0');
      this.detail = undefined;
      this.labelDetails = {
        description: '',
      };
      this.insertText = insertText;
      this.insertTextFormat = 2;
      this.textEditText = name;
      this.textEdit = {
        newText: insertText,
        range,
      };
    }
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof VscodeCompletionItem &&
      this.label === that.label &&
      this.textEditText === that.textEditText &&
      this.sortText === that.sortText &&
      this.textEdit === that.textEdit
    );
  }

  [Hash.symbol](): number {
    return Hash.array([this.label, this.textEdit.newText, this.textEdit.newText]);
  }
}

export class TemplateTokenData implements Equal.Equal {
  constructor(
    readonly token: TemplateTokenWithText,
    readonly base: TemplateTokenWithText | null,
  ) {}

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TemplateTokenData &&
      this.token.text === that.token.text &&
      this.token.bodyLoc.start === that.token.bodyLoc.start &&
      this.token.bodyLoc.end === that.token.bodyLoc.end
    );
  }

  [Hash.symbol](): number {
    return Hash.array([
      this.token.text,
      this.token.bodyLoc.start,
      this.token.bodyLoc.end,
    ]);
  }
}
