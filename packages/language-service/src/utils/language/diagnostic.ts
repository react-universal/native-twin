import * as RA from 'effect/Array';
import * as Equivalence from 'effect/Equivalence';
import { flip, pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import type { BaseTwinTextDocument } from '../../documents/common/BaseTwinDocument.js';
import {
  type DiagnosticHandlerInput,
  TwinDiagnosticCodes,
  VscodeDiagnosticItem,
} from '../../models/diagnostic.model.js';
import type { TwinComposedClassName } from '../../models/TwinParser.models.js';
import { isSameRange } from '../vscode.utils.js';

const createRegionEntriesExtractor =
  (entry: DiagnosticHandlerInput, getRange: ReturnType<typeof bodyLocToRange>, uri: string) =>
  () => {
    return RA.filterMap((input: DiagnosticHandlerInput): Option.Option<DiagnosticToken> => {
      if (isSameEntryClassName(entry, input)) {
        return Option.some<DiagnosticToken>({
          kind: TwinDiagnosticCodes.DuplicatedClassName,
          node: input.composition,
          range: getRange(input),
          uri: uri,
        });
      }
      if (isSameDeclarationProp(entry, input)) {
        return Option.some({
          kind: TwinDiagnosticCodes.DuplicatedDeclaration,
          node: input.composition,
          range: getRange(input),
          uri: uri,
        });
      }
      return Option.none();
    });
  };

export const diagnosticTokensToDiagnosticItems = (
  document: BaseTwinTextDocument,
  languageRegions: DiagnosticHandlerInput[],
): VscodeDiagnosticItem[] => {
  const getRange = bodyLocToRange(document);
  return pipe(
    languageRegions,
    RA.flatMap((_region) => {
      // const regionEntries = region.getFullSheetEntries(twinService.tw);
      const generateExtractor = flip(createRegionEntriesExtractor)();
      return pipe(
        languageRegions,
        RA.map((regionNode) => {
          const range = getRange(regionNode);
          const duplicates = generateExtractor(regionNode, getRange, document.uri)(languageRegions);

          if (duplicates.length < 1) return [];
          const relatedInfo = regionDescriptions(duplicates, document.uri);
          return pipe(
            duplicates,
            RA.filter((x) => !isSameRange(x.range, range)),
            RA.map(
              ({ kind, node }) =>
                new VscodeDiagnosticItem({
                  range,
                  code: kind,
                  entries: [node],
                  uri: document.uri,
                  text: node.text,
                  relatedInfo: relatedInfo.filter((x) => x.kind === kind),
                }),
            ),
            RA.filterMap((x) => (x === null ? Option.none() : Option.some(x))),
          );
        }),
      );
    }),
    RA.flatten,
    RA.dedupe,
  );
};

interface DiagnosticToken {
  kind: TwinDiagnosticCodes;
  node: TwinComposedClassName;
  range: vscode.Range;
  uri: string;
}

export const diagnosticTokenToVscode = (
  { range, kind, node, uri }: DiagnosticToken,
  relatedInfo: vscode.DiagnosticRelatedInformation[],
) => {
  return new VscodeDiagnosticItem({
    range,
    code: kind,
    entries: [node],
    uri: uri,
    text: node.text,
    relatedInfo: relatedInfo,
  });
};

export const regionDescriptions = (data: DiagnosticToken[], uri: string) => {
  return pipe(
    data,
    RA.map((x) => {
      return {
        kind: x.kind,
        location: vscode.Location.create(uri, x.range),
        message: x.node.text,
      };
    }),
  );
};

export const bodyLocToRange =
  (document: BaseTwinTextDocument) => (bodyLoc: DiagnosticHandlerInput) =>
    vscode.Range.create(
      document.positionAt(bodyLoc.composition.startOffset + bodyLoc.parentStart),
      document.positionAt(bodyLoc.composition.endOffset + bodyLoc.parentStart),
    );

export const twinSheetEntryGroupByDuplicates = (entries: DiagnosticHandlerInput[]) => {
  if (!RA.isNonEmptyArray(entries)) return [];
  return pipe(
    RA.groupWith(entries, isSameTwinSheetEntryDeclaration),
    RA.filter((x) => x.length > 1),
    // RA.flatten,
  );
};

const isSameDeclarationProp = Equivalence.make<DiagnosticHandlerInput>(
  (a, b) => a.rule.declarations.join() === b.rule.declarations.join(),
);

const isSameEntryClassName = Equivalence.make<DiagnosticHandlerInput>(
  (a, b) => a.rule.className === b.rule.className,
);

const isSameEntrySelectors = Equivalence.make<DiagnosticHandlerInput>(
  (a, b) => a.composition.text === b.composition.text,
);

export const twinEntryClassNameEquivalence = Equivalence.combine(
  isSameEntryClassName,
  isSameEntrySelectors,
);

export const isSameTwinSheetEntryDeclaration = Equivalence.combine(
  isSameDeclarationProp,
  isSameEntrySelectors,
);
