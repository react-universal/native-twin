import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as vscode from 'vscode-languageserver';
import type { DiagnosticRelatedInformation } from 'vscode-languageserver-types';
import {
  bodyLocToRange,
  isSameTwinSheetEntryDeclaration,
  twinEntryClassNameEquivalence,
  twinSheetEntryGroupByDuplicates,
} from '../utils/language/diagnostic.js';
import { isSameRange } from '../utils/vscode.utils.js';
import type { BaseTwinTextDocument } from './BaseTwinDocument.js';
import {
  type DiagnosticHandlerInput,
  TwinDiagnosticCodes,
  VscodeDiagnosticItem,
} from './diagnostic.model.js';

export class TwinDiagnosticHandler implements Equal.Equal {
  constructor(
    readonly regions: DiagnosticHandlerInput[],
    readonly document: BaseTwinTextDocument,
  ) {}

  get groupByDeclaration() {
    const toRange = bodyLocToRange(this.document);
    const entries = twinSheetEntryGroupByDuplicates(this.regions);
    const flattenEntries = RA.flatten(entries);
    return RA.map(flattenEntries, (entry) => {
      const range = toRange(entry);
      let relatedInfo: DiagnosticRelatedInformation[] = [];
      relatedInfo = pipe(
        RA.map(flattenEntries, (x): DiagnosticRelatedInformation => {
          const otherRange = toRange(x);
          return {
            location: vscode.Location.create(this.document.uri, otherRange),
            message: x.composition.text,
          };
        }),
        RA.filter((x) => !isSameRange(range, x.location.range)),
        RA.dedupeWith(
          (a, b) => a.message === b.message && isSameRange(a.location.range, b.location.range),
        ),
      );
      return new VscodeDiagnosticItem({
        entries: flattenEntries.map((x) => x.composition),
        code: TwinDiagnosticCodes.DuplicatedDeclaration,
        range,
        relatedInfo,
        text: entry.composition.text,
        uri: this.document.uri,
      });
    });
  }

  get groupByClassName() {
    const toRange = bodyLocToRange(this.document);
    const entries = twinSheetEntryGroupByDuplicates(this.regions);
    const flattenEntries = RA.flatten(entries);
    return RA.map(flattenEntries, (entry) => {
      const range = toRange(entry);
      return new VscodeDiagnosticItem({
        entries: flattenEntries.map((x) => x.composition),
        code: TwinDiagnosticCodes.DuplicatedClassName,
        range: range,
        relatedInfo: flattenEntries.map((x): DiagnosticRelatedInformation => {
          const otherRange = toRange(x);
          return {
            location: vscode.Location.create(this.document.uri, otherRange),
            message: x.composition.text,
          };
        }),
        text: entry.composition.text,
        uri: this.document.uri,
      });
    });
  }

  get diagnostics(): VscodeDiagnosticItem[] {
    return this.getDuplicateDiagnostics();
  }

  get count() {
    return this.groupByClassName.length + this.groupByDeclaration.length;
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TwinDiagnosticHandler &&
      this.document.uri === that.document.uri &&
      this.regions.length === that.regions.length &&
      this.count === that.count &&
      this.diagnostics === that.diagnostics
    );
  }

  [Hash.symbol](): number {
    return Hash.array([
      this.count,
      Hash.string(this.document.getText()),
      Hash.string(this.document.uri),
    ]);
  }

  private getDuplicateDiagnostics() {
    const toRange = bodyLocToRange(this.document);
    const diagnostics: VscodeDiagnosticItem[] = [];

    RA.forEach(this.regions, (aEntry, ai) => {
      const currentEntryRange = toRange(aEntry);
      const relatedInfo: DiagnosticRelatedInformation[] = [];
      let diagnosticKind: TwinDiagnosticCodes = TwinDiagnosticCodes.None;
      const entries: DiagnosticHandlerInput[] = [];

      RA.forEach(this.regions, (bEntry, bi) => {
        if (ai === bi) return;

        const duplicatedTokenRange = toRange(bEntry);
        if (isSameTwinSheetEntryDeclaration(aEntry, bEntry)) {
          relatedInfo.push({
            location: vscode.Location.create(this.document.uri, duplicatedTokenRange),
            message: bEntry.composition.text,
          });
          diagnosticKind = TwinDiagnosticCodes.DuplicatedDeclaration;
          entries.push(bEntry);
          return;
        }

        if (twinEntryClassNameEquivalence(aEntry, bEntry)) {
          relatedInfo.push({
            location: vscode.Location.create(this.document.uri, duplicatedTokenRange),
            message: bEntry.composition.text,
          });
          diagnosticKind = TwinDiagnosticCodes.DuplicatedClassName;
          entries.push(bEntry);
          return;
        }
      });
      if (diagnosticKind !== null) {
        diagnostics.push(
          new VscodeDiagnosticItem({
            entries: entries.map((x) => x.composition),
            code: diagnosticKind,
            range: currentEntryRange,
            relatedInfo: RA.dedupeWith(relatedInfo, (a, b) => a.message === b.message),
            text: aEntry.composition.text,
            uri: this.document.uri,
          }),
        );
      }
    });

    return RA.dedupeWith(diagnostics, (a, b) => a.message === b.message);
  }
}
