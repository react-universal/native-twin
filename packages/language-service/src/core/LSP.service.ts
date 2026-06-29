import { type Numberify, type RGBA, TinyColor } from '@ctrl/tinycolor';
import { type SheetEntry, sheetEntriesToCss } from '@native-twin/css';
import { asArray, hash } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { identity, pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as t from 'vscode-languageserver';
import { LSPDocumentsCtxLive } from '../internal/ConnectionHandler.api';
import { LSPAdapterSpec, type LSPTextDocument } from '../internal/LSPAdapterSpec';
import { TwinCompletionItem } from '../models/Editor.models';
import { Position, Range, type Regions } from '../models/LSP.models';
import { TwinDiagnosticCodes } from '../models/lsp.constants';
import type { TwinLSPDocument } from '../models/TwinLSPDocument.model';
import type { ParsedRuleWithLocation } from '../models/TwinParser.models';
import { annotatedLayer } from '../utils/effect.utils';
import { EditorUtils, EditorUtilsLive } from './EditorUtils.service';
import { createDiagnosticsHandler, isValidTwinDiagnostic } from './handlers/diagnostics.handler';
import { LSPConfig } from './LSPConfig.service';
import { SheetUtils, SheetUtilsLive } from './SheetUtils.service';
import { TwinGraphosContextLive } from './TwinGraphos';
import { TwinParserContext, TwinParserContextLive } from './TwinParser.service';

export interface BaseDiagnosticItem {
  entries: SheetEntry[];
  range: t.Range;
  composition: ParsedRuleWithLocation;
}

const make = Effect.gen(function* () {
  const editorUtils = yield* EditorUtils;
  const parser = yield* TwinParserContext;
  const executor = yield* LSPAdapterSpec;
  const sheetUtils = yield* SheetUtils;
  const { configSelector } = yield* LSPConfig;
  const diagnostics = yield* createDiagnosticsHandler;

  const getDocumentDiagnosticsProgram = Effect.fn(function* (
    params: t.DocumentDiagnosticParams,
    _token: t.CancellationToken,
    _workDoneProgress: t.WorkDoneProgressReporter,
    _resultProgress?: t.ResultProgressReporter<t.DocumentDiagnosticReportPartialResult> | undefined,
  ) {
    const document = yield* executor.getLSPDocument(params.textDocument.uri);
    const severity = yield* configSelector((x) => x.diagnostics);
    const reports = yield* diagnostics.evaluateDocument(params.textDocument.uri, severity);
    return {
      kind: 'full',
      resultId: hash(document.uri),
      items: RA.fromIterable(reports),
    } satisfies t.DocumentDiagnosticReport;
  });

  const getDocumentHighLights = Effect.fn(function* (
    params: t.DocumentColorParams,
    _cancelToken: t.CancellationToken,
    _progress: t.WorkDoneProgressReporter,
    _resultProgress: t.ResultProgressReporter<t.ColorInformation[]> | undefined,
  ) {
    const document = yield* executor.getLSPDocument(params.textDocument.uri);

    const regions = Effect.all(
      document.parsableRegions.map(({ data }) =>
        parser.runFullParserEffect(data.value.text, data.value.startOffset),
      ),
    );
    return yield* Stream.fromIterableEffect(regions).pipe(
      Stream.flattenIterables,
      Stream.filterMap((result) =>
        result.entry.pipe(Option.map((entry) => ({ ...result, entry }))),
      ),
      Stream.filter((x) => x.entry.isColor),
      Stream.map(({ entry, parsedRegion }) =>
        declarationValueToColorInfo(
          entry.declarationValue,
          document.getRangeFor(parsedRegion.startOffset, parsedRegion.endOffset),
        ),
      ),
      Stream.filter((x) => x !== null),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
    );
  });

  const getHoverDetails = Effect.fn(function* (
    params: t.HoverParams,
    _cancelToken: t.CancellationToken,
    _progress: t.WorkDoneProgressReporter,
    _resultProgress: t.ResultProgressReporter<t.CompletionItem[]> | undefined,
  ) {
    const document = yield* executor.getLSPDocument(params.textDocument.uri);

    const region = document.findRegionAt(Position.make(params.position));
    if (!region) return undefined;

    const sheetEntries = yield* parser.runTW(region.value.text);
    const entries = sheetEntries;

    return completionRulesToQuickInfo(
      editorUtils.sheetEntriesToMD(entries, yield* parser.data.styledContext),
      editorUtils.getCSSMarkDownParts(sheetEntriesToCss(entries)).join('\n'),
      document.getNodeRange(region.value),
    );
  });

  const getCompletionsAtPosition = (filename: t.URI, position: t.Position) => {
    return Effect.gen(function* () {
      const document = yield* executor.getLSPDocument(filename);
      const cursorOffset = document.offsetAt(position);
      const { parsedRegion } = yield* parsedRegionAtPosition(document, position);
      return yield* Stream.fromIterableEffect(parser.findRulesByKey(parsedRegion.parsed.n)).pipe(
        Stream.map((rule) =>
          new TwinCompletionItem(rule, parsedRegion, cursorOffset, document).toCompletion(),
        ),
        Stream.runCollect,
        Effect.map(RA.fromIterable),
      );
    }).pipe(
      Effect.catchAll((error) =>
        Effect.zipRight(
          Effect.logDebug('Completion: Error in ', filename, position, error.message),
          Effect.succeed<t.CompletionItem[]>([]),
        ),
      ),
    );
  };

  const getCompletionEntryDetails = Effect.fn(function* (
    entry: t.CompletionItem,
    _cancelToken: t.CancellationToken,
  ) {
    const styledContext = yield* parser.data.styledContext;
    const rule = yield* parser.getRuleByClassName(entry.label);

    const sheet = yield* parser.runTW(
      Option.map(rule, (x) => x.className).pipe(Option.getOrElse(() => '')),
    );
    const finalSheet = sheetUtils.getSheetEntryStyles(sheet, styledContext);
    const css = sheetEntriesToCss(sheet);

    return editorUtils.getCompletionEntryDetails(entry, css, finalSheet);
  });

  const twinCodeActionsProgram = Effect.fn(function* (params: t.CodeActionParams) {
    if (params.context.diagnostics.length === 0) return null;
    const document = yield* executor.getLSPDocument(params.textDocument.uri);
    const diagnostics = RA.filterMap(
      params.context.diagnostics,
      Option.liftPredicate(isValidTwinDiagnostic),
    );

    const region = document.findRegionAt(Position.make(params.range.start));
    if (!region) return null;
    const editsForDuplicatedDeclarations: t.CodeAction[] = pipe(
      RA.filter(diagnostics, (x) => x.code === TwinDiagnosticCodes.DuplicatedDeclaration),
      RA.map((x) => getActionsForDuplicatedDecl(x, document.uri)),
    );

    return editsForDuplicatedDeclarations;
  });

  return {
    getCompletionsAtPosition,
    getDocumentDiagnosticsProgram,
    getDocumentHighLights,
    getHoverDetails,
    getCompletionEntryDetails,
    twinCodeActionsProgram,
  };

  function parsedRegionAtPosition(document: LSPTextDocument, position: t.Position) {
    return Effect.fromNullable(document.findRegionAt(position)).pipe(
      Effect.andThen((region) =>
        parser
          .parseRegionAtOffset(region, document.offsetAt(position))
          .pipe(Effect.flatMap(identity)),
      ),
    );
  }
});

export const getDuplicatedDeclarationCodeAction = (
  twinDoc: TwinLSPDocument,
  region: Regions.JSXAttributeValue,
  diagnostics: t.Diagnostic[],
) => {
  // Every duplicated diagnostic carries the FULL set of involved utilities in
  // its `relatedInformation` (kept one included). Collect them across all
  // diagnostics, dedupe by range and order by position: the first declared
  // utility is kept, only the later duplicates are removed.
  const textsToRemove = pipe(
    RA.flatMap(diagnostics, (x) =>
      RA.map(asArray(x.relatedInformation), (info) => Range.encode(info.location.range)),
    ),
    RA.dedupeWith(Range.equals),
    RA.sort(Range.order),
    RA.drop(1),
    RA.map((range) => twinDoc.getText(range)),
  );

  let newText = region.text;
  for (const edit of textsToRemove) {
    newText = newText.replace(edit, '');
  }
  newText = newText.replaceAll(/\s+/g, ' ').trim();
  const fix = t.CodeAction.create('Remove duplicated utilities', t.CodeActionKind.QuickFix);

  fix.edit = {
    changes: {
      [twinDoc.uri]: asArray(t.TextEdit.replace(twinDoc.getNodeRange(region), newText)),
    },
  };
  fix.isPreferred = true;
  fix.diagnostics = diagnostics;
  return asArray(fix);
};

const diagnosticRelatedInfoToEdit = (item: t.DiagnosticRelatedInformation) => {
  return {
    textEdit: t.TextEdit.replace(item.location.range, ''),
    message: item.message,
  };
};

const getActionsForDuplicatedDecl = (diagnosticItem: t.Diagnostic, uri: string): t.CodeAction => {
  const textEdits = RA.map(asArray(diagnosticItem.relatedInformation), diagnosticRelatedInfoToEdit);

  const fix = t.CodeAction.create(
    `Remove duplicated utilities`,
    {
      changes: {
        [uri]: RA.map(textEdits, (x) => x.textEdit),
      },
    },
    t.CodeActionKind.QuickFix,
  );
  fix.isPreferred = true;
  return fix;
};

const completionRulesToQuickInfo = (js: string, css: string, range: t.Range): t.Hover => {
  return {
    range,
    contents: {
      kind: t.MarkupKind.Markdown,
      value: [js, css].join('\n'),
    },
  };
};

/** File private */
function declarationValueToColorInfo(declarationValue: string, range: t.Range): t.ColorInformation {
  return {
    range: range,
    color: toVsCodeColor(new TinyColor(declarationValue).toRgb()),
  };
}

// /** File private */
const toVsCodeColor = (color: Numberify<RGBA>): t.Color =>
  t.Color.create(color.r / 255, color.g / 255, color.b / 255, color.a);

export interface LanguageServerHandlers extends Effect.Effect.Success<typeof make> {}
export const LanguageServerHandlers = Context.GenericTag<LanguageServerHandlers>(
  'lsp/LanguageServerHandlers',
);
export const LanguageServerHandlersLive = Layer.effect(LanguageServerHandlers, make).pipe(
  Layer.provide(TwinGraphosContextLive),
  Layer.provide(LSPDocumentsCtxLive),
  Layer.provide(EditorUtilsLive),
  Layer.provide(TwinParserContextLive),
  Layer.provide(SheetUtilsLive),
  annotatedLayer('LanguageServerHandlers'),
);
