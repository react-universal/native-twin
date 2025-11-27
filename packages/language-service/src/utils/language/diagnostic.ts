// import * as RA from 'effect/Array';
// import * as Equivalence from 'effect/Equivalence';
// import { flip, pipe } from 'effect/Function';
// import * as Option from 'effect/Option';
// import * as vscode from 'vscode-languageserver-types';
// import type { BaseTwinTextDocument } from '../../models/BaseTwinDocument.js';
// import {
//   DiagnosticReport,
//   TwinDiagnosticCodes,
// } from '../../models/Diagnostic.model.js';
// import type { ParsedRuleWithLocation } from '../../models/TwinParser.models.js';
// import { isSameRange } from '../vscode.utils.js';

// export const diagnosticTokensToDiagnosticItems = (
//   document: BaseTwinTextDocument,
//   languageRegions: DiagnosticHandlerInput[],
// ): DiagnosticReport[] => {
//   const getRange = bodyLocToRange(document);
//   return pipe(
//     languageRegions,
//     RA.flatMap((_region) => {
//       // const regionEntries = region.getFullSheetEntries(twinService.tw);
//       const generateExtractor = flip(createRegionEntriesExtractor)();
//       return pipe(
//         languageRegions,
//         RA.map((regionNode) => {
//           const range = getRange(regionNode);
//           const duplicates = generateExtractor(regionNode, getRange, document.uri)(languageRegions);

//           if (duplicates.length < 1) return [];
//           const relatedInfo = regionDescriptions(duplicates, document.uri);
//           return pipe(
//             duplicates,
//             RA.filter((x) => !isSameRange(x.range, range)),
//             RA.map(
//               ({ kind, node }) =>
//                 new DiagnosticReport({
//                   range,
//                   code: kind,
//                   entries: [node],
//                   uri: document.uri,
//                   text: node.fullText,
//                   relatedInfo: relatedInfo.filter((x) => x.kind === kind),
//                 }),
//             ),
//             RA.filterMap((x) => (x === null ? Option.none() : Option.some(x))),
//           );
//         }),
//       );
//     }),
//     RA.flatten,
//     RA.dedupe,
//   );
// };

// interface DiagnosticToken {
//   kind: TwinDiagnosticCodes;
//   node: ParsedRuleWithLocation;
//   range: vscode.Range;
//   uri: string;
// }

// export const diagnosticTokenToVscode = (
//   { range, kind, node, uri }: DiagnosticToken,
//   relatedInfo: vscode.DiagnosticRelatedInformation[],
// ) => {
//   return new DiagnosticReport({
//     range,
//     code: kind,
//     entries: [node],
//     uri: uri,
//     text: node.fullText,
//     relatedInfo: relatedInfo,
//   });
// };

// export const regionDescriptions = (data: DiagnosticToken[], uri: string) => {
//   return pipe(
//     data,
//     RA.map((x) => {
//       return {
//         kind: x.kind,
//         location: vscode.Location.create(uri, x.range),
//         message: x.node.fullText,
//       };
//     }),
//   );
// };

// export const bodyLocToRange =
//   (document: BaseTwinTextDocument) => (bodyLoc: DiagnosticHandlerInput) =>
//     vscode.Range.create(
//       document.positionAt(bodyLoc.composition.startOffset + bodyLoc.parentStart),
//       document.positionAt(bodyLoc.composition.endOffset + bodyLoc.parentStart),
//     );

// export const twinSheetEntryGroupByDuplicates = (entries: DiagnosticHandlerInput[]) => {
//   if (!RA.isNonEmptyArray(entries)) return [];
//   return pipe(
//     RA.groupWith(entries, isSameTwinSheetEntryDeclaration),
//     RA.filter((x) => x.length > 1),
//     // RA.flatten,
//   );
// };

// const isSameDeclarationProp = Equivalence.make<DiagnosticHandlerInput>(
//   (a, b) => a.rule.declarations.join() === b.rule.declarations.join(),
// );

// const isSameEntryClassName = Equivalence.make<DiagnosticHandlerInput>(
//   (a, b) => a.rule.className === b.rule.className,
// );

// const isSameEntrySelectors = Equivalence.make<DiagnosticHandlerInput>(
//   (a, b) => a.composition.fullText === b.composition.fullText,
// );

// export const twinEntryClassNameEquivalence = Equivalence.combine(
//   isSameEntryClassName,
//   isSameEntrySelectors,
// );

// export const isSameTwinSheetEntryDeclaration = Equivalence.combine(
//   isSameDeclarationProp,
//   isSameEntrySelectors,
// );
