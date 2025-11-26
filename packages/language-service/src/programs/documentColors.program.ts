import { Array, Option } from 'effect';
import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';
import { createCompositionsComposer } from '../models/TwinParser.models.js';
import { LSPAdapterSpec, TwinParserContext } from '../Services.js';
import { declarationValueToColorInfo } from '../utils/language/colorInfo.utils.js';

export const getDocumentColors = Effect.fn(function* (
  params: vscode.DocumentColorParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.ColorInformation[]> | undefined,
) {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const twinService = yield* TwinParserContext;
  const document = yield* getLSPDocument(params.textDocument.uri);

  const composers = document.parsableRegions
    .map((data) => {
      const parserResult = twinService.runTwinParser({
        text: data.attr.text,
        startOffset: document.offsetAt(data.attr.range.start),
      });
      const composer = createCompositionsComposer(parserResult, document);
      return composer;
    })
    .flatMap((composer) =>
      composer.parserResult.composedClasses.map((x) => ({
        className: composer.getCompositionText(x),
        composition: x,
      })),
    );

  const classNames = yield* Effect.all(
    composers.map((_) =>
      twinService.getRuleByClassName(_.className).pipe(
        Effect.map((registry) =>
          Option.map(registry, (x) => ({
            className: _,
            rule: x,
            composition: _.composition,
          })).pipe(
            Option.filter(
              (x) => x.rule.info.meta.feature === 'colors' || x.rule.info.themeSection === 'colors',
            ),
          ),
        ),
      ),
    ),
  );

  return Array.getSomes(classNames).map((comp) =>
    declarationValueToColorInfo(
      comp.rule.declarationValue,
      document.getRangeFor(
        comp.composition.startOffset + comp.composition.parentStarts - 1,
        comp.composition.endOffset + comp.composition.parentStarts - 1,
      ),
    ),
  );
  // return Option.map(document, (x) =>
  //   ,
  // ).pipe(
  //   Option.match({
  //     onSome: (result): vscode.ColorInformation[] => result,
  //     onNone: () => [],
  //   }),
  // );
});
