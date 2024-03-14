import { PluginPass, NodePath } from '@babel/core';
import { BabelAPI } from '../types';

const allowedFileRegex =
  /^(?!.*[\/\\](react|react-native|react-native-web|native-twin-metro)[\/\\]).*$/;

const isValidFile = (x: string = '') => allowedFileRegex.test(x);

const createVisitorStateContext = (state: PluginPass) => {
  return {
    isValidPath: isValidFile(state.filename),
  };
};

// const isReactCreateElementIdent = <T>(path: NodePath<T>) =>
//   path.isIdentifier({ name: 'createElement' });

// const createScopeContext = (binding?: Binding) => {
//   const path = binding?.path;
//   if (!path) return null;
//   return {
//     isVariableDeclaration: path.isVariableDeclaration,
//   };
// };

export const createVisitorContext =
  (_types: BabelAPI['types']) =>
  <T>(path: NodePath<T>, state: PluginPass) => {
    const stateContext = createVisitorStateContext(state);

    return {
      stateContext,
      tree: {
        root: path,
        parent: path.parent,
      },
    };
  };
