// @ts-expect-error
import babelJSX from '@babel/plugin-syntax-jsx';
import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import micromatch from 'micromatch';
import nodePath from 'node:path';
import path from 'node:path';
import type { __Theme__ } from '@native-twin/core';
import { ChildsSheet, getChildRuntimeEntries } from '@native-twin/css/jsx';
import { TreeNode } from '@native-twin/helpers/tree';
import { CompiledTree, JSXElementTree } from '..';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../../constants/twin.constants';
import { JSXElementNode } from '../models/JSXElement.model';
import { BabelTransformerConfig, BabelTransformerFn } from '../models/metro.models';
import { getElementEntries } from '../twin';
import { NativeTwinService } from './NativeTwin.service';

export class MetroCompilerContext extends Context.Tag('metro/babel/transformer-context')<
  MetroCompilerContext,
  BabelTransformerConfig
>() {
  static make = (
    { filename, options, src }: Parameters<BabelTransformerFn>[0],
    generate: BabelTransformerConfig['generate'],
  ) =>
    Layer.effect(
      MetroCompilerContext,
      Effect.gen(function* () {
        const twin = yield* NativeTwinService;
        const cssOutput = nodePath.join(
          options.projectRoot,
          TWIN_CACHE_DIR,
          TWIN_STYLES_FILE,
        );
        const platform = options.platform;

        return {
          generate,
          options,
          cssOutput,
          code: src,
          filename: filename,
          allowedPaths: twin.config.content.map((x) =>
            path.resolve(options.projectRoot, path.join(x)),
          ),
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
    compileTreeNode(leave: TreeNode<JSXElementTree>): TreeNode<CompiledTree>;
  }
>() {}

export const BabelTransformerServiceLive = Layer.effect(
  BabelTransformerService,
  Effect.gen(function* () {
    const ctx = yield* MetroCompilerContext;
    const twin = yield* NativeTwinService;
    return {
      // compileCode: (code) => twinBabelPluginTransform(code),
      isNotAllowedPath: (file) => {
        return !micromatch.isMatch(
          nodePath.resolve(ctx.options.projectRoot, file),
          ctx.allowedPaths,
        );
      },
      compileTreeNode(leave: TreeNode<JSXElementTree>): TreeNode<CompiledTree> {
        const leaveValue = { ...leave.value };
        const parentNode = { ...leave.parent?.value } as unknown as
          | CompiledTree
          | JSXElementTree;
        const node = { ...leaveValue.path.node };

        const current = new JSXElementNode(node, leaveValue.order, ctx.filename, null);
        const entries = getElementEntries(current.runtimeData, twin.tw, twin.context);
        const childEntries = pipe(entries, getChildRuntimeEntries);
        // entries = pipe(entries, getRawSheet);
        let inheritedEntries: ChildsSheet | null = null;
        if (
          parentNode &&
          'node' in parentNode &&
          parentNode.node instanceof JSXElementNode
        ) {
          inheritedEntries = null;
        }
        leave.value = {
          // @ts-expect-error
          node: current,
          order: leaveValue.order,
          uid: leaveValue.uid,
          inheritedEntries,
          entries,
          childEntries,
        };
        return leave as any;
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
