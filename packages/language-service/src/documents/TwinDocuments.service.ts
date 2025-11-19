import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import type ts from 'ts-morph';
import { TypescriptApi } from '../typescript';
import { type TwinDocumentID, TwinDocumentTS } from './TwinDocumentTS.model';

export const make = Effect.gen(function* () {
  const tsAPI = yield* TypescriptApi;
  const storeRef = yield* Ref.make(HashMap.empty<TwinDocumentID, TwinDocumentTS>());

  const loadFile = Effect.fn(function* (source: ts.SourceFile) {
    const parsed = yield* tsAPI.parseSourceFile(source);
    return new TwinDocumentTS(parsed.node, parsed.jsxDeclarators);
  });

  const storeAP = <A>(
    f: (_: HashMap.HashMap<TwinDocumentID, TwinDocumentTS>) => Effect.Effect<A>,
  ) => Effect.succeed(f).pipe(Effect.ap(Ref.get(storeRef)));

  const getDocument = (id: TwinDocumentID) =>
    storeAP((registry) => Effect.sync(() => registry.pipe(HashMap.get(id))));

  const registerDoc = (doc: TwinDocumentTS) =>
    storeAP((registry) => Effect.sync(() => HashMap.set(registry, doc.id, doc)));

  const hasDoc = (id: TwinDocumentID) =>
    storeAP((registry) => Effect.sync(() => registry.pipe(HashMap.has(id))));

  yield* Effect.gen(function* () {
    const sourceFiles = yield* Effect.sync(() => tsAPI.tsProject.getSourceFiles());
    const parsedFiles = yield* Effect.all(sourceFiles.map((_) => loadFile(_)));
    for (const file of parsedFiles) {
      yield* registerDoc(file);
    }
  });

  return {
    getDocument,
    registerDoc,
    hasDoc,
  };
});

export interface DocumentsRegistry extends Effect.Effect.Success<typeof make> {}
export const DocumentsRegistry = Context.GenericTag<DocumentsRegistry>('DocumentsRegistry');

export const DocumentsRegistryLive = Layer.effect(DocumentsRegistry, make);
