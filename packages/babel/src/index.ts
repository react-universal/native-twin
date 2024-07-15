import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import * as Option from 'effect/Option';
import nodePath from 'node:path';
import { RuntimeTW } from '@native-twin/core';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { isReactImport, isReactRequire } from './effects/path.effects';
import { createMemberExpressionProgram } from './effects/programs';
import { createVisitorContext } from './effects/visitor-context';
import { visitJSXElement } from './jsx/jsx.element';
import { getUserTwinConfig, setupNativeTwin } from './runtime/twin.setup';
import { TwinBabelOptions } from './types/plugin.types';

let twin: Option.Option<RuntimeTW> = Option.none();

export default function nativeTwinBabelPlugin(
  _: any,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj {
  const twConfig = getUserTwinConfig(cwd, options);
  twin = setupNativeTwin(twConfig, {
    dev: false,
    hot: false,
    platform: 'ios',
  });
  const allowedPaths = twConfig.pipe(
    Option.map((x) => x.content.map((x) => nodePath.resolve(cwd, nodePath.join(x)))),
    Option.getOrElse((): string[] => []),
  );
  const createContext = createVisitorContext(allowedPaths);
  return {
    name: '@native-twin/babel-plugin',
    visitor: {
      MemberExpression(path, state) {
        const context = createContext(path, state);

        if (!context.stateContext.isValidPath) return;

        const shouldReplace = createMemberExpressionProgram(path);

        if (shouldReplace) {
          path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
          state.file.scope.path.traverse({
            Identifier() {},
          });
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
        if (!context.stateContext.isValidPath || twin._tag === 'None') {
          return;
        }
        visitJSXElement(path, twin.value);
      },
    },
  };
}
