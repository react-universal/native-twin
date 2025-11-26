// import type * as vscode from 'vscode';
// import {
//   getCompletionsForTokens,
//   LSPConstants,
//   parseTemplate,
//   type TemplateTokenWithText,
// } from '@native-twin/language-service';
// import * as RA from 'effect/Array';
// import * as Context from 'effect/Context';
// import * as Effect from 'effect/Effect';
// import { pipe } from 'effect/Function';
// import * as Layer from 'effect/Layer';
// import * as Option from 'effect/Option';
// import { extensionConfigState } from '../extension/extension.utils';
// import { TwinTextDocument } from './common/TwinTextDocument.model';
// import { completionRulesToVscodeCompletionItems } from './mappers/completion.mappers';

// const getParsedNodeAtOffset = (nodes: TemplateTokenWithText[], offset: number) => {
//   return RA.findFirst(nodes, (x) => offset >= x.bodyLoc.start && offset <= x.bodyLoc.end);
// };

// const make = Effect.gen(function* () {
//   const config = yield* Effect.flatMap(
//     extensionConfigState(LSPConstants.lspRawConfig),
//     (x) => x.get,
//   );

//   return {
//     async provideCompletionItems(document, position, _token, _context) {
//       const twinDocument = new TwinTextDocument(document);
//       const cursorOffset = twinDocument.document.offsetAt(position);
//       const foundToken = twinDocument.findTokenLocationAt(position, config);

//       const completions: vscode.CompletionItem[] = pipe(
//         Option.map(foundToken, (x) => {
//           return parseTemplate(x.text, x.offset.start);
//         }),
//         Option.flatMap((tokens) => getParsedNodeAtOffset(tokens, cursorOffset)),
//         Option.map((parsedNode) => {
//           const tokens = getCompletionsForTokens(parsedNode.flattenToken, []);
//           return completionRulesToVscodeCompletionItems(
//             parsedNode.flattenToken,
//             tokens,
//             twinDocument,
//           );
//         }),
//         Option.getOrElse(() => []),
//       );

//       return Promise.resolve({
//         items: completions,
//         isIncomplete: true,
//       });
//     },
//   } satisfies vscode.CompletionItemProvider;
// });

// export interface VscodeCompletionsProvider extends vscode.CompletionItemProvider {}
// export const VscodeCompletionsProvider = Context.GenericTag<VscodeCompletionsProvider>(
//   'vscode/client/VscodeCompletionsProvider',
// );

// export const VscodeCompletionsProviderLive = Layer.effect(VscodeCompletionsProvider, make);
