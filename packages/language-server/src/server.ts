// import { Context, pipe } from 'effect';
// import * as Effect from 'effect/Effect';
// import * as Option from 'effect/Option';
// import * as Ref from 'effect/Ref';
// import * as Cached from 'effect/Resource';
// import { TextDocument } from 'vscode-languageserver-textdocument';
// import * as vscode from 'vscode-languageserver/node';
// import { onInitializeConnection } from './connection/connection.handlers';
// import * as Connection from './connection/connection.resource';
// import { TwinDocument } from './documents/document.resource';
// import * as LanguageService from './language/language.service';
// import { NativeTwinHandler, createTwin } from './native-twin/nativeTwin.resource';
// import { NativeTwinService } from './native-twin/nativeTwin.service';
// import { runWithTokenDefault } from './utils/effect.utils';

// const serverMain = Effect.gen(function* ($) {
//   const connectionRef = yield* $(Connection.make);
//   let isInitialized = false;

//   const connection = yield* $(connectionRef.get);

//   const documents = new vscode.TextDocuments(TextDocument);
//   const twinServiceRef = yield* $(Ref.make(createTwin()));
//   const cachedTwin = yield* $(Cached.manual(Ref.get(twinServiceRef)));

//   connection.onInitialize((params) => {
//     const result = onInitializeConnection(params);
//     const newTwin = createTwin(Option.getOrUndefined(result.configFiles.twinConfigFile));
//     pipe(Ref.set(twinServiceRef, newTwin), Effect.zipRight(Cached.refresh(cachedTwin)));
//     isInitialized = true;
//     return result.capabilities;
//   });

//   connection.listen();
//   documents.listen(connection);

//   return {
//     connection: connection,
//     documents,
//     getDocument,
//     isInitialized,
//     getTwin: () =>
//       pipe(
//         Ref.get(twinServiceRef),
//         Effect.zipRight(Cached.refresh(cachedTwin)),
//         Effect.zipRight(Cached.get(cachedTwin)),
//       ),
//   };

//   function getDocument(id: vscode.TextDocumentIdentifier) {
//     return Option.fromNullable(documents.get(id.uri)).pipe(
//       Option.map((x) => new TwinDocument(x)),
//     );
//   }
// });

// const program = Effect.gen(function* ($) {
//   const { connection, getTwin } = yield* $(serverMain)


//   connection.onCompletion((params, token, pr, rp) => {
//     Context.make(NativeTwinService, {
//       nativeTwin: Ref.make(getTwin(),),
//     });
//     return runWithTokenDefault(
//       LanguageService.getCompletionsAtPosition(params, token, pr, rp).pipe(
//         Effect.provideService(NativeTwinService, twin),
//         Effect.provideService(DocumentsService, documentsService),
//       ),
//       token,
//     );
//   });
// });
