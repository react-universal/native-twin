import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { pipe } from 'effect/Function';
import * as HM from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Tuple from 'effect/Tuple';
import { CompilerContext } from '@native-twin/css/build/jsx';
import { createVisitorContext } from './babel/babel.common';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { isReactImport, isReactRequire } from './effects/path.effects';
import { createMemberExpressionProgram } from './effects/programs';
import jsxVisitors from './jsx/jsx.visitors';
import { jsxElementNodeKey } from './jsx/models/JSXElement.model';
import { getUserTwinConfig, setupNativeTwin } from './runtime';
// import { addOrderToJSXChilds, compileMappedAttributes } from './jsx/jsx.maps';
import { BabelAPI, TwinBabelOptions, TwinVisitorsState } from './types/plugin.types';

export default function nativeTwinBabelPlugin(
  _: BabelAPI,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj<TwinVisitorsState> {
  const createContext = createVisitorContext(cwd, options);
  const twConfig = getUserTwinConfig(cwd, options);
  const twin = setupNativeTwin(twConfig, options);
  const ctx: CompilerContext = {
    baseRem: twin.config.root.rem,
    platform: options.platform,
  };

  return {
    name: '@native-twin/babel-plugin',
    pre() {
      this.visited = HM.empty();
    },
    visitor: {
      MemberExpression(path, state) {
        const context = createContext(path, state);

        if (!context.stateContext.isValidPath) return;

        const shouldReplace = createMemberExpressionProgram(path);

        if (shouldReplace) {
          path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
        }
      },
      Identifier(path, state) {
        const context = createContext(path, state);
        if (!context.stateContext.isValidPath) return;
        if (path.node.name === 'createElement' && path.parentPath.isCallExpression()) {
          const binding = path.scope.getBinding(path.node.name);
          if (!binding) return;
          if (isReactRequire(binding) || isReactImport(binding)) {
            path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
          }
        }
      },
      JSXElement(path, state) {
        const context = createContext(path, state);
        if (!context.stateContext.isValidPath) return;

        const visitedNode = jsxVisitors.visitJSXElement(path, twin, ctx, state);

        this.visited = pipe(
          this.visited,
          HM.set(visitedNode.nodeKey, visitedNode.elementNode),
          HM.union(
            HM.fromIterable(
              HashSet.map(visitedNode.elementNode.childs, (x) =>
                Tuple.make(jsxElementNodeKey(x.path, state), x),
              ),
            ),
          ),
        );
      },
    },
  };
}
