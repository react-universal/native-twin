import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as t from 'vscode-languageserver-types';
import * as vscode from 'vscode-languageserver-types';
import { Range } from './LSP.models';
import { LSPConstants, type TwinConfigOptions, TwinDiagnosticCodes } from './lsp.constants';
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

export interface DiagnosticReportInput {
  code: TwinDiagnosticCodes;
  location: vscode.Location;
  rulesInfo: { text: string; location: vscode.Location }[];
  customReason?: string;
  severity: TwinConfigOptions['diagnostics'];
}

export class DiagnosticReport implements Equal.Equal {
  readonly _tag = 'DiagnosticReport';
  private readonly relatedInfo: vscode.DiagnosticRelatedInformation[];
  private _diagnostic: vscode.Diagnostic | null = null;

  get code() {
    return this.input.code;
  }

  constructor(private readonly input: DiagnosticReportInput) {
    this.relatedInfo = RA.dedupeWith(
      this.input.rulesInfo,
      Equivalence.mapInput(Range.equals, (rule: (typeof this.input.rulesInfo)[number]) =>
        Range.encode(rule.location.range),
      ),
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
      severity:
        this.input.severity === 'warn'
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information,
      tags: [vscode.DiagnosticTag.Unnecessary],
    });
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof DiagnosticReport &&
      this.input.location.uri === that.input.location.uri &&
      this.input.code === that.input.code &&
      Range.equals(Range.encode(this.input.location.range), Range.encode(this.input.location.range))
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
