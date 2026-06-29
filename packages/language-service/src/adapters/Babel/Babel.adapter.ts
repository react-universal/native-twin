import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { LSPDocumentsCtx } from '../../internal/ConnectionHandler.api';
import { LSPAdapterSpec } from '../../internal/LSPAdapterSpec';
import type { Position, Regions } from '../../models/LSP.models';
import { TwinLSPDocument } from '../../models/TwinLSPDocument.model';
import { BabelUtils, BabelUtilsLive } from './BabelUtils.service';

export const BabelLSPAdapterLive = Effect.gen(function* () {
  const { getDocument } = yield* LSPDocumentsCtx;
  const babelUtils = yield* BabelUtils;

  const getLSPDocument = Effect.fn(function* (filename: string) {
    const document = yield* getDocument(filename);
    const filePath = filename.replaceAll(/file:\/*/g, '');
    const regions = yield* getRegionsFromCode(filePath, document.getText());

    return new TwinLSPDocument(document, regions);
  });

  const getRegions = (filename: string) =>
    getLSPDocument(filename).pipe(Effect.map((x) => x.regions));

  const getRegionAt = (filename: string, position: Position) =>
    getLSPDocument(filename).pipe(Effect.map((x) => x.findRegionAt(position)));

  return LSPAdapterSpec.of({
    getRegions,
    getLSPDocument,
    getRegionAt,
  });

  function getRegionsFromCode(filename: string, code: string) {
    return Effect.gen(function* () {
      const ast = yield* Effect.sync(() => babelUtils.babelParse(code, filename));
      const roots = yield* babelUtils.getAllJSXElements(ast);
      const registered = new Map<number, Regions.JSXNode>();
      return yield* Stream.fromIterable(roots).pipe(
        Stream.map((jsxElement) => {
          let parent: null | Regions.JSXNode = null;
          if (jsxElement.parent?.value) {
            parent = registered.get(jsxElement.parent.id) ?? null;
          }
          const result = babelUtils.regionFromJSXElementPath(jsxElement, parent);
          registered.set(jsxElement.treeNode.id, result);
          return result;
        }),
        Stream.runCollect,
        Effect.map(Array.fromIterable),
      );
    });
  }
}).pipe(Layer.effect(LSPAdapterSpec), Layer.provide(BabelUtilsLive));
