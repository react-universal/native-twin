import { inspect } from 'util';
import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as RcMap from 'effect/RcMap';
import * as Stream from 'effect/Stream';
import type { TwinBabelModule, TwinJSXElement, TwinJSXElementNode } from '../Babel';
import type { TwinPath } from '../FileSystem';
import {
  JSXElementNodeSheet,
  type TwinExtractorFn,
  TwinJSXElementSheet,
  type TwinTransformFn,
} from './Model';

export const makeTransformer = (
  transformer: TwinTransformFn,
  modules: Effect.Effect<Iterable<TwinBabelModule>>,
) =>
  Stream.fromIterableEffect(modules).pipe(
    Stream.runFoldEffect(
      new Map<TwinPath.FilePath, Iterable<TwinJSXElementSheet>>(),
      (acc, item) =>
        Effect.map(transformer(item), (sheets) => acc.set(item.file.path, sheets)),
    ),
  );

export const createModuleTransformer =
  (
    getExtractor: Effect.Effect<TwinExtractorFn>,
    getModules: Effect.Effect<Iterable<TwinBabelModule>>,
  ) =>
  (module: TwinBabelModule) =>
    Effect.gen(function* () {
      const currentModules = yield* getModules;
      const getStyledProps = yield* getExtractor;

      const cache = yield* RcMap.make({
        lookup: (key: TwinJSXElementNode) =>
          Effect.acquireRelease(
            Effect.sync(() =>
              Iterable.head(
                Iterable.filterMap(currentModules, (external) =>
                  external.file.path === module.file.path
                    ? Option.none()
                    : external.getJSXElementFromNode(key),
                ),
              ),
            ),
            () => Effect.log('Releasing transformer lookup'),
          ),
      });

      const getJSXElementNodeSheet = (treeNode: TreeNode<TwinJSXElementNode>) =>
        Effect.gen(function* () {
          const breadcrumb = treeNode.getPath().map((x) => `${x.value.id}`);
          const styledProps = getStyledProps(treeNode.value.styledProps);
          if (Option.isNone(treeNode.value.dependency)) {
            return new JSXElementNodeSheet(styledProps, Option.none(), breadcrumb);
          }
          const found = yield* RcMap.get(cache, treeNode.value);
          yield* Effect.log('FOUND: ', inspect(found, false, 2, true));

          if (Option.isSome(found)) {
            breadcrumb.pop();
            breadcrumb.push(found.value.id);
          }

          return new JSXElementNodeSheet(styledProps, found, breadcrumb);
        });

      const getJSXElementSheet = (jsxElement: TwinJSXElement) =>
        Stream.fromIterable(jsxElement.tree.all()).pipe(
          Stream.mapEffect((treeNode) => getJSXElementNodeSheet(treeNode)),
          Stream.runCollect,
        );

      const sheets = yield* Stream.fromIterable(module.jsxElements).pipe(
        Stream.mapEffect((jsxElement) =>
          getJSXElementSheet(jsxElement).pipe(
            Effect.andThen(
              (sheets) => new TwinJSXElementSheet(jsxElement, RA.fromIterable(sheets)),
            ),
          ),
        ),
        Stream.runCollect,
      );

      return RA.fromIterable(sheets);
    }).pipe(Effect.scoped);
