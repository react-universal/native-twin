// import { PluginObj, transformSync } from '@babel/core';
// @ts-expect-error
import babelJSX from '@babel/plugin-syntax-jsx';
// import { File } from '@babel/types';
import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
// import { pipe } from 'effect/Function';
// import * as HashMap from 'effect/HashMap';
// import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
// import * as Option from 'effect/Option';
// import * as Tuple from 'effect/Tuple';
import micromatch from 'micromatch';
import nodePath from 'node:path';
// import {
//   BabelJSXElementNode,
//   babelJsxElementNodeKey,
//   addTwinPropsToElement,
//   BabelAPI,
//   TwinBabelOptions,
//   TwinVisitorsState,
//   getJSXElementName,
// } from '@native-twin/babel/jsx-babel';
import type { __Theme__ } from '@native-twin/core';
import {
  getTwinConfig,
  setupNativeTwin,
  TWIN_CACHE_DIR,
  TWIN_STYLES_FILE,
} from '../../utils';
import { BabelTransformerConfig, BabelTransformerFn } from './babel.types';

export class BabelTransformerContext extends Context.Tag('babel/transformer-context')<
  BabelTransformerContext,
  BabelTransformerConfig
>() {
  static make = (
    { filename, options, src }: Parameters<BabelTransformerFn>[0],
    generate: BabelTransformerConfig['generate'],
  ) =>
    Layer.effect(
      BabelTransformerContext,
      Effect.sync(() => {
        const cssOutput = nodePath.join(
          options.projectRoot,
          TWIN_CACHE_DIR,
          TWIN_STYLES_FILE,
        );
        const platform = options.platform;
        const twinConfig = getTwinConfig(options.projectRoot);
        const twin = setupNativeTwin(twinConfig.twinConfig, {
          dev: options.dev,
          hot: options.dev,
          platform,
        });

        return {
          generate,
          options,
          cssOutput,
          code: src,
          filename: filename,
          twinCtx: {
            baseRem: twin.config.root.rem ?? 16,
            platform,
          },
          twin,
          twinConfig: twinConfig.twinConfig,
          allowedPaths: twinConfig.allowedPaths,
          platform,
        };
      }),
    );
}

export class BabelTransformerService extends Context.Tag('babel/TransformerService')<
  BabelTransformerService,
  {
    isNotAllowedPath(path: string): boolean;
    transform(code: string): Promise<any>;
    // compileCode: (
    //   code: string,
    // ) => Effect.Effect<Option.Option<File>, never, BabelTransformerContext>;
  }
>() {}

export const BabelTransformerServiceLive = Layer.effect(
  BabelTransformerService,
  Effect.gen(function* () {
    const ctx = yield* BabelTransformerContext;

    return {
      // compileCode: (code) => twinBabelPluginTransform(code),
      isNotAllowedPath: (file) => {
        return !micromatch.isMatch(
          nodePath.resolve(ctx.options.projectRoot, file),
          ctx.allowedPaths,
        );
      },
      transform: (code) => {
        // @ts-expect-error
        return upstreamTransformer.transform({
          src: code,
          options: ctx.options,
          filename: ctx.filename,
        });
      },
    };
  }),
);

// const twinBabelPluginTransform = (code: string) =>
//   Effect.gen(function* () {
//     const ctx = yield* BabelTransformerContext;
//     const generated = transformSync(code, {
//       // parserOpts: {
//       //   plugins: ['jsx', 'typescript'],
//       // },
//       code: false,
//       plugins: [
//         [
//           nativeTwinJSXBabelPlugin,
//           {
//             twinConfigPath: './tailwind.config.ts',
//           },
//         ],
//       ],
//       sourceType: 'unambiguous',
//       filename: ctx.filename,
//       ast: true,
//       cwd: ctx.options.projectRoot,
//       envName: process.env['NODE_ENV'],
//       minified: false,
//       generatorOpts: {
//         minified: false,
//       },
//       compact: false,
//     });

//     return Option.fromNullable(generated?.ast);

//     function nativeTwinJSXBabelPlugin(
//       _: BabelAPI,
//       options: TwinBabelOptions,
//       cwd: string,
//     ): PluginObj<TwinVisitorsState> {
//       return {
//         inherits: babelJSX,
//         pre() {
//           this.visited = HashMap.empty();
//           this.tree = {
//             _tag: 'tree',
//             value: [],
//           };
//         },
//         visitor: {
//           // Program: {
//           //   exit(state) {
//           //     this;
//           //     console.log('THESSS', state);
//           //   },
//           // },
//           JSXElement: {
//             exit() {
//               if (this.tree.value.length > 1) {
//                 const child = this.tree.value.pop();
//                 const parent = this.tree.value[this.tree.value.length - 1];
//                 if (child && parent) {
//                   parent.childs.push(child);
//                 }
//               }
//             },
//             enter(path) {
//               // console.log('STATE: ', state, this);
//               const key = babelJsxElementNodeKey(path.node, ctx.filename);
//               const elementNode = pipe(
//                 this.visited,
//                 HashMap.get(key),
//                 Option.match({
//                   onNone: () => {
//                     console.log('NOT_CACHED');
//                     return new BabelJSXElementNode(path.node, 0, ctx.filename, null);
//                   },
//                   onSome: (a) => {
//                     console.log('CACHED: ');
//                     return a;
//                   },
//                 }),
//               );
//               const sheet = elementNode.getTwinSheet(
//                 ctx.twin,
//                 ctx.twinCtx,
//                 HashSet.size(elementNode.childs),
//               );

//               addTwinPropsToElement(elementNode, sheet.propEntries, ctx.generate);
//               // updateVisitedNodes(key, elementNode, sheet);
//               this.visited = pipe(
//                 this.visited,
//                 HashMap.set(key, elementNode),
//                 HashMap.union(
//                   HashMap.fromIterable(
//                     HashSet.map(elementNode.childs, (x) =>
//                       Tuple.make(babelJsxElementNodeKey(x.path, ctx.filename), x),
//                     ),
//                   ),
//                 ),
//               );
//               this.tree.value.push({
//                 childs: [],
//                 filename: elementNode.filename,
//                 id: elementNode.id,
//                 node: getJSXElementName(elementNode.openingElement).pipe(
//                   Option.getOrElse(() => 'Unknown'),
//                 ),
//                 order: elementNode.order,
//                 parentNode: null,
//                 source: elementNode.binding(path).pipe(
//                   Option.map((x) => x.source),
//                   Option.getOrElse(() => 'Local'),
//                 ),
//               });
//             },
//           },
//         },
//       };
//     }
//   });
