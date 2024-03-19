import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { isReactImport, isReactRequire } from './effects/path.effects';
import { createMemberExpressionProgram } from './effects/programs';
import { createVisitorContext } from './effects/visitor-context';
import { BabelAPI } from './types';

export default function nativeTwinBabelPlugin(babel: BabelAPI): PluginObj {
  // const t = babel.types;
  const createContext = createVisitorContext(babel.types);

  return {
    name: '@native-twin/native-twin-metro-imports',
    visitor: {
      MemberExpression(path, state) {
        const context = createContext(path, state);

        if (!context.stateContext.isValidPath) return;

        const shouldReplace = createMemberExpressionProgram(path);

        if (shouldReplace) {
          path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
          return;
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
    },
  };
}
