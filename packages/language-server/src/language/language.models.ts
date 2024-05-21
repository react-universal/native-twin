// import * as ReadOnlyArray from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver-types';
import { RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { DocumentLanguageRegion } from '../documents/document.resource';
import { TemplateTokenWithText } from '../template/template.models';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../types/native-twin.types';
import { isSameRange } from '../utils/vscode.utils';
import {
  getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
} from './utils/language.utils';

export class VscodeCompletionItem implements vscode.CompletionItem, Equal.Equal {
  label: string;
  readonly kind: vscode.CompletionItemKind;
  readonly filterText: string;
  readonly sortText: string;
  readonly detail: string | undefined;
  readonly labelDetails: vscode.CompletionItemLabelDetails;
  insertText: string;
  readonly insertTextFormat: vscode.InsertTextFormat;
  textEditText: string;
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
  private _entries: SheetEntry[] | undefined = undefined;
  constructor(
    readonly token: TemplateTokenWithText,
    readonly base: TemplateTokenWithText | null,
  ) {}

  getSheetEntries(tw: RuntimeTW) {
    if (this._entries) {
      return this._entries;
    }
    this._entries = tw(`${this.token.text}`);
    return this._entries;
  }

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

export interface DiagnosticsMeta {
  readonly document: TextDocument;
  readonly regions: DocumentLanguageRegion[];
}

export interface DiagnosticsTokenShape {
  parsed: TemplateTokenWithText[];
  flatten: TemplateTokenData[];
  range: vscode.Range;
  text: string;
}

export class DiagnosticsToken
  extends Data.TaggedClass('DiagnosticsToken')<DiagnosticsTokenShape>
  implements Equal.Equal
{
  private _entries: SheetEntry[] | undefined = undefined;
  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof DiagnosticsToken &&
      this.flatten.length === that.flatten.length &&
      this.parsed.length === that.parsed.length &&
      isSameRange(this.range, that.range)
    );
  }

  [Hash.symbol](): number {
    return Hash.array([Hash.structure(this.range), this.text, this.flatten.length]);
  }

  get flattenUnique() {
    return this.flatten;
  }

  getSheetEntries(tw: RuntimeTW) {
    if (this._entries) {
      return this._entries;
    }
    const text = this.text.replace(/'/g, '');
    this._entries = tw(`${text}`);
    return this._entries;
  }

  get sameClassNames() {
    return;
  }
}
