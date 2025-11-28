// import * as Effect from 'effect/Effect';
// import * as Equal from 'effect/Equal';
// import { identity } from 'effect/Function';
// import * as Hash from 'effect/Hash';
// import * as HashMap from 'effect/HashMap';
// import * as Option from 'effect/Option';
// import * as SubscriptionRef from 'effect/SubscriptionRef';
// import type { TextDocument } from 'vscode-languageserver-textdocument';
// import { LSPContext } from '../core/LSPContext.service';
// import * as LSPTypes from '../internal/LSPAdapterSpec';
// import { JSXParser, TypeScriptProgram } from '../Services';

// export const make = Effect.gen(function* () {
//   const context = yield* LSPContext;
//   const { getSourceFile, project } = yield* TypeScriptProgram;
//   const documents = yield* SubscriptionRef.make(
//     HashMap.empty<LSPDocumentID, LSPTypes.LSPTextDocument>(),
//   );

//   const getLSPDocument = Effect.fn(function* (filename: string) {
//     return yield* Effect.succeed(context.getDocument(filename))
//       .pipe(Effect.flatMap(identity))
//       .pipe(Effect.mapError((e) => LSPTypes.FileNotFound.create(e)));
//   });

//   return {
//     documents,
//     getLSPDocument,
//     getDocument,
//     project,
//   };

//   function getDocument(uri: string) {
//     return Effect.succeed(context.getDocument(uri))
//       .pipe(
//         Effect.flatMap(identity),
//         Effect.andThen((document) => Effect.zip(Effect.succeed(document), documents.get)),
//         Effect.andThen(([textDoc, store]) => {
//           const id = new LSPDocumentID(textDoc);
//           const maybeDoc = HashMap.get(store, id);
//           if (Option.isSome(maybeDoc)) return Effect.succeed(maybeDoc.value);
//         }),
//       )
//       .pipe(Effect.mapError((e) => LSPTypes.FileNotFound.create(e)));
//   }
// });

// const createStore = Effect.gen(function* () {
//   const { documents } = yield* LSPContext;
//   const parser = yield* JSXParser;
//   const ts = yield* TypeScriptProgram;
//   const cache = new Map<string, LSPDocumentHandler>();

//   const parseFile = Effect.fn(function* (uri: string) {
//     const cached = cache.get(uri);

//     const doc = documents.get(uri);
//     if (!doc) return yield* Effect.fail(LSPTypes.FileNotFound.create(`store: File not found.`));

//     if (cached && cached.version === doc.version) {
//       return cached;
//     }

//     const tsSource = yield* ts.getSourceFile(uri, doc.getText());
//     const regions = parser.jsxNodesToRegions(parser.getJSXRootsFromSource(tsSource), doc);

//     return { tsSource, regions };
//   });

//   return { parseFile };
// });

// export class LSPDocumentHandler {
//   private get text() {
//     return this.document.getText();
//   }

//   get version() {
//     return this.document.version;
//   }

//   constructor(
//     private document: TextDocument,
//     private readonly parser: JSXParser,
//     private readonly regions: LSPTypes.JsxNodeRegion[],
//   ) {}

//   updateDocument() {}
// }

// class LSPDocumentID implements Equal.Equal {
//   constructor(private readonly doc: TextDocument) {}
//   [Hash.symbol](): number {
//     return Hash.combine(Hash.string(this.doc.uri))(Hash.number(this.doc.version));
//   }

//   [Equal.symbol](that: unknown): boolean {
//     return (
//       that instanceof LSPDocumentID &&
//       this.doc.uri === that.doc.uri &&
//       this.doc.version === that.doc.version &&
//       this.doc.languageId === that.doc.languageId &&
//       this.doc.lineCount === that.doc.lineCount
//     );
//   }
// }
