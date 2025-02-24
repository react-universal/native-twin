import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type {
  TwinBabelModule,
  TwinDependenciesLookup,
  TwinJSXElement,
  TwinJSXElementNode,
} from '../Babel';
import { JSXElementNodeSheet, TwinJSXElementSheet } from './JSXStyleSheet';
import type { TwinExtractorFn } from './Model';

export const createModuleExtractor =
  (
    getExtractor: Effect.Effect<TwinExtractorFn>,
    searchDependency: ReturnType<TwinDependenciesLookup>,
  ) =>
  (module: TwinBabelModule) =>
    Effect.gen(function* () {
      const getStyledProps = yield* getExtractor;

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

      function getJSXElementNodeSheet(treeNode: TreeNode<TwinJSXElementNode>) {
        return Effect.gen(function* () {
          const breadcrumb = treeNode.getPath().map((x) => `${x.value.id}`);
          const styledProps = getStyledProps(treeNode.value.styledProps);

          if (Option.isNone(treeNode.value.dependency)) {
            return new JSXElementNodeSheet(styledProps, Option.none(), breadcrumb);
          }
          const found = searchDependency(treeNode.value);
          // yield* Effect.log('FOUND: ', inspect(found, false, 2, true));

          if (Option.isSome(found)) {
            breadcrumb.pop();
            breadcrumb.push(found.value.id);
          }

          return new JSXElementNodeSheet(styledProps, found, breadcrumb);
        });
      }
    }).pipe(Effect.scoped);
