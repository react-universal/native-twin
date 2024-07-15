import { PluginPass, NodePath } from '@babel/core';
import micromatch from 'micromatch';

const allowedFileRegex =
  /^(?!.*[/\\](react|react-native|react-native-web|@native-twin\/*)[/\\]).*$/;

const isValidFile = (x = '', allowedFiles: string[]) => {
  if (!micromatch.isMatch(x, allowedFiles)) {
    return false;
  }
  return allowedFileRegex.test(x);
};

const createVisitorStateContext = (state: PluginPass, allowedPaths: string[]) => {
  return {
    isValidPath: isValidFile(state.filename, allowedPaths),
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
  (allowedPaths: string[]) =>
  <T>(path: NodePath<T>, state: PluginPass) => {
    const stateContext = createVisitorStateContext(state, allowedPaths);

    return {
      stateContext,
      tree: {
        root: path,
        parent: path.parent,
      },
    };
  };
