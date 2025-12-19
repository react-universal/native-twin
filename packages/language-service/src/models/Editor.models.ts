import { TinyColor } from '@ctrl/tinycolor';
import type { CssFeature, SheetEntry } from '@native-twin/css';
import toCssFormat from 'cssbeautify';
import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import { css_beautify, js_beautify } from 'js-beautify';
import * as t from 'vscode-languageserver-types';
import * as vscode from 'vscode-languageserver-types';
import type { AnyInternalTwinRule } from '../internal/TwinTypes.internal';
import { composeDeclarations, type StyledContext } from '../utils/sheet.utils';
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
  rules: { text: string; location: vscode.Location }[];
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
      this.input.rules,
      Equivalence.mapInput(Range.equals, (rule: (typeof this.input.rules)[number]) =>
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

export class CompletionEntryDetails {
  constructor(private readonly completion: vscode.CompletionItem) {}

  toCompletionEntryDetails(css: string, sheetEntry: Record<string, any>): vscode.CompletionItem {
    return {
      ...this.completion,
      documentation: {
        kind: vscode.MarkupKind.Markdown,
        value: getDocumentationMarkdown(sheetEntry, css),
      },
    };
  }
}

export function getCompletionEntryDetailsDisplayParts(rule: {
  themeSection: AnyInternalTwinRule[1] | (string & {});
  feature: CssFeature;
  declarationValue: string;
}) {
  if (rule.feature === 'colors' || rule.themeSection === 'colors') {
    const hex = new TinyColor(rule.declarationValue);
    if (hex.isValid) {
      return {
        kind: 'color',
        text: hex.toHexString(),
      };
    }
    return {
      kind: 'color',
      text: rule.declarationValue,
    };
  }
  return undefined;
}

export const getCSSMarkDownParts = (css: string) => {
  const result: string[] = [];
  result.push('***Css Rules*** \n\n');
  result.push(
    `${'```css\n'}${css_beautify(css, {
      indent_size: 2,
      indent_level: 0,
      indent_with_tabs: false,
      newline_between_rules: false,
      space_around_combinator: true,
    })}${'\n```'}`,
  );
  result.push('\n\n');
  return result;
};

export const getRNMarkDownParts = (nativeStyles: string) => {
  const result: string[] = [];
  result.push('#### React Native StyleSheet\n\n');
  result.push(['```typescript\n', nativeStyles, '\n```'].join('\n'));
  return result;
};

export function getDocumentationMarkdown(sheetEntry: Record<string, any>, css: string) {
  const result: string[] = [];
  result.push('***Css Rules*** \n\n');
  result.push(
    `${'```css\n'}${toCssFormat(css, {
      indent: '\t',
      openbrace: 'end-of-line',
      autosemicolon: true,
    })}${'\n```'}`,
  );
  result.push('\n\n');
  result.push('#### React Native StyleSheet\n');
  const rnSheet = Object.entries(sheetEntry).filter((x) => Object.keys(x[1]).length > 0);
  result.push(createJSONMarkdownString(Object.fromEntries(rnSheet)));
  return result.join('\n');
}

const createJSONMarkdownString = <T extends object>(x: T) =>
  ['```json', JSON.stringify(x, null, 2), '```'].join('\n');

export const sheetEntriesToMD = (entries: SheetEntry[], context: StyledContext) => {
  const template: string[] = [];
  template.push('StyleSheet.create(');
  template.push('{');

  for (const current of entries) {
    const nextDecl = composeDeclarations(current.declarations, context);
    template.push(`"${current.className}": `);
    template.push(JSON.stringify(nextDecl, null, 2));
  }
  template.push('});');
  const result = js_beautify(template.join('\n'), {
    brace_style: 'preserve-inline',
    indent_level: 0,
    indent_size: 1,
    indent_with_tabs: false,
    space_in_paren: false,
    comma_first: false,
  });
  return ['#### React Native StyleSheet', '```typescript', result, '\n```'].join('\n');
};
