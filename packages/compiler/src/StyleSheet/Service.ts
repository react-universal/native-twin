import type { TreeNode } from '@native-twin/helpers/tree';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { TwinJSXElementNode } from '../Babel';
import { TwinNodeContext, type TwinRunnerPlatform } from '../Config';
import { TwinExtractor } from './Extractor';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const extractor = new TwinExtractor(ctx.state.twRunners.ref);

  const getJSXElementNodeSheet = (
    treeNode: TreeNode<TwinJSXElementNode>,
    platform: TwinRunnerPlatform,
  ) =>
    Effect.gen(function* () {
      const runner = yield* extractor.getExtractor(platform);
      const selectorPath = treeNode.getPath();
      const compiledProps = treeNode.value.styledProps.map((prop) => {
        return {
          prop,
        };
      });
      return {
        selectorPath,
      };
    });

  return { extractor };

  // function getProjectSheet(
  //   modules: Stream.Stream<[TwinPath.FilePath, TwinBabelModule]>,
  //   platform: TwinRunnerPlatform,
  // ) {
  //   return modules.pipe(
  //     Stream.mapEffect(([_, module]) => getModuleSheet(platform, module)),
  //     Stream.runCollect,
  //     // TODO: handle as chunks
  //     // Effect.map(RA.fromIterable),
  //     Effect.map((modules) => new ProjectStyleSheet(modules)),
  //   );
  // }

  // function getModuleSheet(platform: TwinRunnerPlatform, module: TwinBabelModule) {
  //   return Stream.fromIterable(module.jsxElements).pipe(
  //     Stream.mapEffect((jsxElement) =>
  //       mapTreeEffect(jsxElement.tree, (node) =>
  //         Effect.map(
  //           extractor.getStyledProps(node.value.styledProps, platform),
  //           (compiledProps) => new JSXElementNodeSheet(node.value, compiledProps),
  //         ),
  //       ).pipe(Effect.andThen((tree) => new TwinJSXElementSheet(jsxElement, tree))),
  //     ),
  //     Stream.runCollect,
  //     // TODO: handle as chunks
  //     Effect.map(RA.fromIterable),
  //     Effect.andThen((elements) => new BabelModuleSheet(platform, module, elements)),
  //   );
  // }
});

export interface TwinStyleSheetContext extends Effect.Effect.Success<typeof make> {}
export const TwinStyleSheetContext = Context.GenericTag<TwinStyleSheetContext>(
  '_____TwinStyleSheetContext',
);

export const TwinStyleSheetContextLive = Layer.effect(TwinStyleSheetContext, make);
