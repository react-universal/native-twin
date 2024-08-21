import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HM from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Record from 'effect/Record';
import * as Tuple from 'effect/Tuple';
import {
  JSXElementNode,
  jsxElementNodeKey,
  JSXElementNodeKey,
} from '../jsx/models/JSXElement.model';

export class CacheService extends Context.Tag('cache/global')<
  CacheService,
  {
    // storedFiles: HM.HashMap<JSXElementNodeKey, JSXElementNode>;
    // state: Effect.Effect<TransformerState, never, never>;
    getCache: () => HM.HashMap<JSXElementNodeKey, JSXElementNode>;
    addNewNodeToCache: (
      key: JSXElementNodeKey,
      visitedNode: JSXElementNode,
      filename: string,
    ) => HM.HashMap<JSXElementNodeKey, JSXElementNode>;
    getTrees: () => Record<string, JSXElementNode[]>;
    getSize: () => number;
    // getState: Effect.Effect<JSXElementNode[], never, never>;
  }
>() {}

let cache = HM.empty<JSXElementNodeKey, JSXElementNode>();
// const transformerState = Effect.sync(() => TransformerState.make()).pipe(Effect.runSync);

export const CacheLayerLive = Layer.scoped(
  CacheService,
  Effect.gen(function* () {
    return {
      getCache: () => cache,
      getTrees,
      getSize: () => HM.size(cache),
      addNewNodeToCache: (key, node, filename) => {
        cache = mutateCache(key, node, filename);
        return cache;
      },
    };
  }),
);

const getTrees = () =>
  pipe(
    cache,
    HM.values,
    RA.fromIterable,
    RA.groupBy((x) => x.filename),
    Record.map((nodes) => {
      return pipe(
        nodes,
        RA.initNonEmpty,
        RA.filter((x) => !x.parent),
      );
    }),
  );

const mutateCache = (key: JSXElementNodeKey, node: JSXElementNode, filename: string) =>
  pipe(
    cache,
    HM.set(key, node),
    HM.union(
      HM.fromIterable(
        HashSet.map(node.childs, (x) =>
          Tuple.make(jsxElementNodeKey(x.path, filename), x),
        ),
      ),
    ),
  );
