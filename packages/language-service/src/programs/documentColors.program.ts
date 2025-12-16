import { type Numberify, type RGBA, TinyColor } from '@ctrl/tinycolor';
import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type * as vscode from 'vscode-languageserver';
import { Color } from 'vscode-languageserver-types';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';

export const getDocumentColors = Effect.fn(function* (
  params: vscode.DocumentColorParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.ColorInformation[]> | undefined,
) {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const twinService = yield* TwinParserContext;
  const document = yield* getLSPDocument(params.textDocument.uri);

  return yield* Stream.fromIterable(document.parsableRegions).pipe(
    Stream.mapEffect((region) =>
      twinService.runFullParserEffect(region.attr.text, region.attr.startOffset),
    ),
    Stream.flattenIterables,
    Stream.map((result) => {
      if (!result.entry) return null;
      if (
        result.entry.info.styleProperty === 'color' ||
        result.entry.info.themeSection === 'colors'
      ) {
        return declarationValueToColorInfo(
          result.entry.declarationValue,
          document.getRangeFor(result.parsedRegion.startOffset, result.parsedRegion.endOffset),
        );
      }
      return null;
    }),
    Stream.filter((x) => x !== null),
    Stream.runCollect,
    Effect.map(Array.fromIterable),
  );
});

/** File private */
const declarationValueToColorInfo = (
  declarationValue: string,
  range: vscode.Range,
): vscode.ColorInformation => ({
  range: range,
  color: toVsCodeColor(new TinyColor(declarationValue).toRgb()),
});

// /** File private */
const toVsCodeColor = (color: Numberify<RGBA>): vscode.Color =>
  Color.create(color.r / 255, color.g / 255, color.b / 255, color.a);
