import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { createVisitorContext } from './babel/babel.common';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { isReactImport, isReactRequire } from './effects/path.effects';
import { createMemberExpressionProgram } from './effects/programs';
import { visitJSXElement } from './jsx/jsx.element';
import { BabelAPI, TwinBabelOptions } from './types/plugin.types';

export default function nativeTwinBabelPlugin(
  _: BabelAPI,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj {
  const createContext = createVisitorContext(cwd, options);
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
        if (!context.stateContext.isValidPath || context.twin._tag === 'None') {
          return;
        }
        visitJSXElement(path, context.twin.value);
      },
    },
  };
}
