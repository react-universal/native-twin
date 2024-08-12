import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { createVisitorContext } from './babel/babel.common';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { isReactImport, isReactRequire } from './effects/path.effects';
import { createMemberExpressionProgram } from './effects/programs';
import jsxVisitors from './jsx/jsx.visitors';
import { getUserTwinConfig, setupNativeTwin } from './runtime';
// import { addOrderToJSXChilds, compileMappedAttributes } from './jsx/jsx.maps';
import { BabelAPI, TwinBabelOptions } from './types/plugin.types';

export default function nativeTwinBabelPlugin(
  _: BabelAPI,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj {
  const createContext = createVisitorContext(cwd, options);
  const twConfig = getUserTwinConfig(cwd, options);
  const twin = setupNativeTwin(twConfig, options);
  return {
    name: '@native-twin/babel-plugin',
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
      JSXElement: (path, state) => {
        const context = createContext(path, state);

        if (!context.stateContext.isValidPath) return;
        jsxVisitors.visitJSXElement(path, twin, state);
        // path.traverse(jsxVisitors.jsxElementVisitor, { order: 0 });
      },
    },
  };
}
