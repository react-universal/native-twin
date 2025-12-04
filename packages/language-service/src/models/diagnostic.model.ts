import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as vscode from 'vscode-languageserver-types';
import { isSameRange } from '../utils/vscode.utils';
import { LSPConstants } from './lsp.constants';

export interface DiagnosticReportInput {
  code: TwinDiagnosticCodes;
  location: vscode.Location;
  rules: { text: string; location: vscode.Location }[];
  customReason?: string;
}

export class DiagnosticReport implements Equal.Equal {
  private readonly relatedInfo: vscode.DiagnosticRelatedInformation[];
  private _diagnostic: vscode.Diagnostic | null = null;

  get code() {
    return this.input.code;
  }

  constructor(private readonly input: DiagnosticReportInput) {
    this.relatedInfo = RA.dedupeWith(this.input.rules, (a, b) =>
      isSameRange(a.location.range, b.location.range),
    ).map((rule) => vscode.DiagnosticRelatedInformation.create(rule.location, rule.text));
  }

  get diagnostic() {
    return (this._diagnostic ??= this.getDiagnostic());
  }

  getDiagnostic(): vscode.Diagnostic {
    const input = this.input;
    return (this._diagnostic ??= {
      code: input.code,
      message: input.customReason ? input.customReason : `${this.getDiagnosticMessage(input.code)}`,
      range: input.location.range,
      relatedInformation: this.relatedInfo,
      source: LSPConstants.diagnosticProviderSource,
      severity: vscode.DiagnosticSeverity.Warning,
      tags: [vscode.DiagnosticTag.Unnecessary],
    });
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof DiagnosticReport &&
      this.input.location.uri === that.input.location.uri &&
      this.input.code === that.input.code &&
      isSameRange(this.input.location.range, that.input.location.range)
    );
  }

  [Hash.symbol](): number {
    return Hash.array([this.input.location, this.input.code]);
  }

  private getDiagnosticMessage(code: TwinDiagnosticCodes) {
    switch (code) {
      case TwinDiagnosticCodes.None:
        return '';
      case TwinDiagnosticCodes.DuplicatedDeclaration:
        return 'Duplicated Class Utility';
      case TwinDiagnosticCodes.DuplicatedClassName:
        return 'Duplicated ClassName';
    }
  }
}

export enum TwinDiagnosticCodes {
  None = '000',
  DuplicatedDeclaration = '001',
  DuplicatedClassName = '002',
}
