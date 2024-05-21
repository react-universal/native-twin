import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as vscode from 'vscode-languageserver-types';
import { SheetEntry } from '@native-twin/css';
import { isSameRange } from '../../utils/vscode.utils';

export class VscodeDiagnosticItem implements vscode.Diagnostic, Equal.Equal {
  readonly message: string;
  readonly code: string;
  readonly range: vscode.Range;
  readonly relatedInformation: vscode.DiagnosticRelatedInformation[];
  readonly source: string;
  readonly severity: vscode.DiagnosticSeverity;
  readonly tags: vscode.DiagnosticTag[];
  constructor(data: {
    range: vscode.Range;
    kind: keyof typeof DIAGNOSTIC_ERROR_KIND;
    entries: SheetEntry[];
    uri: string;
    text: string;
  }) {
    const meta = DIAGNOSTIC_ERROR_KIND[data.kind];
    this.message = meta.message;
    this.range = data.range;
    this.relatedInformation = [
      {
        location: vscode.Location.create(data.uri, this.range),
        message: data.text,
      },
    ];
    this.code = this.getSourceCode(data.kind, data.entries);
    this.source = meta.code;
    this.severity = vscode.DiagnosticSeverity.Warning;
    this.tags = [vscode.DiagnosticTag.Unnecessary];
  }

  private getSourceCode(kind: keyof typeof DIAGNOSTIC_ERROR_KIND, entries: SheetEntry[]) {
    if (kind === 'DUPLICATED_CLASS_NAME') {
      return entries.map((x) => x.className).join(', ');
    }
    return entries
      .flatMap((x) => x.declarations)
      .flatMap((x) => x.prop)
      .join(', ');
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof VscodeDiagnosticItem &&
      this.message === that.message &&
      this.code === that.code &&
      isSameRange(this.range, that.range)
    );
  }

  [Hash.symbol](): number {
    return Hash.array([this.message, this.code]);
  }
}

export const DIAGNOSTIC_ERROR_KIND = {
  DUPLICATED_DECLARATION: {
    code: 'DUPLICATED_PROP',
    message: 'Duplicated CSS Declaration',
  },
  DUPLICATED_CLASS_NAME: {
    code: 'DUPLICATED_CLASSNAME',
    message: 'Duplicated ClassName',
  },
};
