import * as vscode from 'vscode';
import {
  LSPConstants,
  Position,
  TwinLSPDocument,
  TwinParserContext,
} from '@native-twin/language-service';
import { JSXParser, TypeScriptProgram } from '@native-twin/language-service/ts-adapter';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';

export const CompletionsService = Effect.gen(function* () {
  const jsxPArser = yield* JSXParser;
  const program = yield* TypeScriptProgram;
  const parser = yield* TwinParserContext;

  yield* Effect.addFinalizer(() => Effect.log('Discard completions'));

  return vscode.languages.registerCompletionItemProvider(LSPConstants.documentSelectors, {
    provideCompletionItems: async (document, position) => {
      const result = await Effect.gen(function* () {
        const tsSource = yield* program.getSourceFile(document.uri.path, document.getText());
        const roots = jsxPArser.getJSXRootsFromSource(tsSource);
        const vsDocument = TextDocument.create(
          document.uri.fsPath,
          document.languageId,
          document.version,
          document.getText(),
        );
        const regions = jsxPArser.jsxNodesToRegions(roots);
        const lspDocument = new TwinLSPDocument(vsDocument, regions);

        const cursorOffset = document.offsetAt(position);

        const valueRegion = Option.fromNullable(lspDocument.findRegionAt(Position.make(position)));

        const parserResult = Option.map(valueRegion, ({ value }) =>
          parser.runTwinParser({
            text: value.text,
            startOffset: value.startOffset,
          }),
        );
        const locatedToken = yield* Option.flatMap(parserResult, ({ result }) =>
          Option.fromNullable(
            result.find(
              (token) => cursorOffset >= token.startOffset && cursorOffset <= token.endOffset,
            ),
          ),
        );

        // const location = lspDocument.locationAtOffsets(
        //   locatedToken.startOffset,
        //   locatedToken.endOffset,
        // );
        const twinRules = yield* parser.findRulesByKey(locatedToken.parsed.n);

        return twinRules;
      }).pipe(Effect.runPromise);
      console.log('RESULT: ', result);
      return Promise.resolve([]);
    },
  });
}).pipe(Layer.effectDiscard);
