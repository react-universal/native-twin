import { TinyColor } from '@ctrl/tinycolor';
import { HashSet } from 'effect';
import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { getFlattenTemplateToken } from './utils/language.utils';

export const getDocumentColors = (
  params: vscode.DocumentColorParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.ColorInformation[]> | undefined,
): Effect.Effect<
  vscode.ColorInformation[],
  never,
  NativeTwinManagerService | DocumentsService
> => {
  return Effect.gen(function* () {
    const twinService = yield* NativeTwinManagerService;
    const documentsHandler = yield* DocumentsService;

    return Option.Do.pipe(
      Option.bind('document', () => documentsHandler.getDocument(params.textDocument)),

      Option.let('templates', (x) => x.document.getAllTemplates()),

      Option.bind('colors', ({ templates, document }) =>
        Option.all(templates).pipe(
          Option.map((x) =>
            pipe(
              x,
              ReadonlyArray.dedupe,
              ReadonlyArray.flatMap((template) => template.parsedNode),
              ReadonlyArray.flatMap((x) => {
                const flatten = getFlattenTemplateToken(x);
                return flatten;
              }),
              ReadonlyArray.dedupe,
              ReadonlyArray.flatMap((x) => {
                return twinService.completions.twinRules.pipe(
                  HashSet.filter((y) => y.completion.className === x.token.text),
                  ReadonlyArray.fromIterable,
                  ReadonlyArray.map((completion) => ({ node: x, completion })),
                  ReadonlyArray.filter(
                    (x) => x.completion.rule.themeSection === 'colors',
                  ),
                  ReadonlyArray.map((x): vscode.ColorInformation => {
                    const color = new TinyColor(x.completion.completion.declarationValue).toRgb();
                    return {
                      range: vscode.Range.create(
                        document.handler.positionAt(x.node.token.bodyLoc.start),
                        document.handler.positionAt(x.node.token.bodyLoc.end),
                      ),
                      color: vscode.Color.create(
                        color.r / 255,
                        color.g / 255,
                        color.b / 255,
                        color.a,
                      ),
                    };
                  }),
                );
              }),
            ),
          ),
        ),
      ),

      Option.match({
        onSome: (result): vscode.ColorInformation[] => result.colors,
        // r.colors.map((x) => {
        //   return {
        //     range: vscode.Range.create(
        //       r.document.handler.positionAt(x.template.bodyLoc.start),
        //       r.document.handler.positionAt(x.template.bodyLoc.end),
        //     ),
        //     color: vscode.Color.create(0, 0, 0, 0),
        //   };
        // }),
        onNone: () => [],
      }),
    );
  });
};
