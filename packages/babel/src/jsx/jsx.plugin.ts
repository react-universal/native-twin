import type { PluginObj, PluginPass } from '@babel/core';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import { Tree } from '@native-twin/helpers/tree';
import { JSXImportPluginContext } from '../jsx-import/JSXImport.service';
import { JSXElementNode } from '../models';
import type { BabelAPI, TwinBabelOptions } from '../types/plugin.types';
import { addTwinPropsToElement } from './ast/jsx.builder';
import {
  extractMappedAttributes,
  gelBabelJSXElementChildLeaves,
  getJSXCompiledTreeRuntime,
  getJSXElementSource,
} from './ast/jsx.maps';
import type { JSXElementTree } from './jsx.types';

const program = Effect.scoped(
  Effect.gen(function* () {
    const ctx = yield* JSXImportPluginContext;
    return {
      name: '@native-twin/twin-babel-plugin-jsx',
      pre() {
        this.trees = [];
      },
      post() {
        for (const jsxElement of this.trees) {
          const fileTrees = HashMap.fromIterable(transformBabelTree(jsxElement));
          pipe(
            fileTrees,
            HashMap.forEach((value) => {
              const { leave, runtimeSheet } = getJSXCompiledTreeRuntime(
                value,
                pipe(
                  value.parentID,
                  Option.flatMap((x) => HashMap.get(fileTrees, x)),
                ),
              );
              addTwinPropsToElement(leave, runtimeSheet, {
                componentID: true,
                order: true,
                styledProps: true,
                templateStyles: true,
              });
            }),
          );
        }
      },
      visitor: {
        Program: {
          exit() {
            this.trees;
          },
        },
        JSXElement(path, state) {
          if (!ctx.isValidFile(state.filename)) return;

          const hash = Hash.string(state.filename ?? 'Unknown');
          const uid = path.scope.generateUid();
          const parentTree = new Tree<JSXElementTree>({
            order: -1,
            babelNode: path.node,
            uid: `${hash}_${uid}`,
            cssImports: [],
            source: getJSXElementSource(path),
            parentID: null,
          });
          gelBabelJSXElementChildLeaves(path, parentTree.root);
          this.trees.push(parentTree);
          path.skip();
        },
      },
    } as PluginObj<PluginPass & { trees: Tree<JSXElementTree>[] }>;

    function transformBabelTree(tree: Tree<JSXElementTree>) {
      const fileSheet = RA.empty<[string, JSXElementNode]>();
      tree.traverse((leave) => {
        const { value } = leave;

        const runtimeData = extractMappedAttributes(leave.value.babelNode);
        const model = new JSXElementNode({
          leave,
          order: value.order,
          filename: `${leave.id}`,
          runtimeData,
          twin: {
            config: ctx.twin.config,
            preflight: {},
            context: ctx.twCtx,
            tw: ctx.twin,
          },
        });
        fileSheet.push([model.id, model]);
      }, 'breadthFirst');

      return fileSheet;
    }
  }),
);

// const layer = Logger.replace(Logger.defaultLogger, BabelLogger);

export default function nativeTwinBabelPluginJSX(
  _: BabelAPI,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj<PluginPass & { trees: Tree<JSXElementTree>[] }> {
  return program.pipe(
    // Logger.withMinimumLogLevel(LogLevel.All),
    // Effect.provide(layer),
    Effect.provide(JSXImportPluginContext.make(options, cwd)),
    Effect.runSync,
  );
}
