import * as vscode from 'vscode';
import { LSPConstants } from '@native-twin/language-service';
import { parseTemplate } from '@native-twin/language-service/browser';
import * as RA from 'effect/Array';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { VscodeContext } from '../../extension/extension.service';
import { extensionConfigState } from '../../extension/extension.utils';
import { TwinTextDocument } from './TwinTextDocument.model';

export const TwinVscodeHightLightsProviderLive = Effect.gen(function* () {
  const extensionCtx = yield* VscodeContext;
  const { get } = yield* extensionConfigState(LSPConstants.lspRawConfig);
  const config = yield* get;
  const provideDocumentHighlights: vscode.DocumentHighlightProvider['provideDocumentHighlights'] = (
    document,
    position,
    _token,
  ) => {
    const twinDocument = new TwinTextDocument(document);
    // const cursorOffset = twinDocument.document.offsetAt(position);
    const foundToken = twinDocument.findTokenLocationAt(position, config);

    const highlights = pipe(
      Option.map(foundToken, (x) => {
        return parseTemplate(x.text, x.offset.start);
      }),
      // Option.flatMap((tokens) => getParsedNodeAtOffset(tokens, cursorOffset)),
      Option.getOrElse(() => []),
      RA.map(
        (node): vscode.DocumentHighlight => ({
          range: new vscode.Range(
            document.positionAt(node.bodyLoc.start),
            document.positionAt(node.bodyLoc.end),
          ),
          kind: vscode.DocumentHighlightKind.Text,
        }),
      ),
      // Option.map(asArray),
    );

    return highlights;
  };

  const highLightsProviders = LSPConstants.documentSelectors.map((selector) =>
    vscode.languages.registerDocumentHighlightProvider(selector, {
      provideDocumentHighlights,
    }),
  );
  extensionCtx.subscriptions.push(...highLightsProviders);
}).pipe(
  Effect.withLogSpan('LanguageServiceClient'),
  Effect.onError((error) => Effect.logError('ERROR: ', Cause.prettyErrors(error))),
  Layer.scopedDiscard,
);
