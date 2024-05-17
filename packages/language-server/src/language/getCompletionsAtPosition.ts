import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { VscodeCompletionItem } from './language.models';
import {
  getCompletionsForTokens,
  extractDocumentNodeAtPosition,
  extractParsedNodesAtPosition,
} from './utils/completion.pipes';
import * as Completions from './utils/completions.maps';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) =>
  Effect.gen(function* () {
    const twinService = yield* NativeTwinManagerService;
    const extracted = yield* extractDocumentNodeAtPosition(params);

    const nodesAtPosition = extracted.pipe(
      Option.flatMap((meta) =>
        extractParsedNodesAtPosition({
          cursorOffset: meta.cursorOffset,
          parsedText: meta.parsedText,
        }),
      ),
    );

    console.log('NODES: ', nodesAtPosition);

    const completionEntries = Option.flatMap(extracted, (meta) => {
      if (meta.isEmptyCompletion) {
        return Option.some(
          Completions.getAllCompletionRules(
            twinService.completions,
            vscode.Range.create(
              meta.document.positionAt(meta.cursorOffset),
              meta.document.positionAt(meta.cursorOffset + 1),
            ),
          ),
        );
      }

      return Option.map(
        extractParsedNodesAtPosition({
          cursorOffset: meta.cursorOffset,
          parsedText: meta.parsedText,
        }),
        (x) => {
          const tokens = getCompletionsForTokens(x.flattenNodes, twinService);
          return Completions.completionRulesToEntries(
            x.flattenNodes,
            tokens,
            meta.document,
          );
        },
      );
    });

    return Option.getOrElse(completionEntries, (): VscodeCompletionItem[] => []);
  });
