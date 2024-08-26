import type { PluginPass, NodePath } from '@babel/core';
import { parse } from '@babel/parser';
import micromatch from 'micromatch';
import nodePath from 'node:path';
import type { RuntimeTW } from '@native-twin/core';
import { getUserTwinConfig, setupNativeTwin } from '../jsx/twin/twin.setup';
import type { TwinBabelOptions } from '../types/plugin.types';

let twin: RuntimeTW | undefined = undefined;

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

export const createVisitorContext = (rootPath: string, options: TwinBabelOptions) => {
  const twConfig = getUserTwinConfig(rootPath, options);
  twin = setupNativeTwin(twConfig, options);
  const allowedPaths = twConfig.content.map((x) =>
    nodePath.resolve(rootPath, nodePath.join(x)),
  );
  return <T>(path: NodePath<T>, state: PluginPass) => {
    const stateContext = createVisitorStateContext(state, allowedPaths);

    return {
      stateContext,
      twConfig,
      twin,
      tree: {
        root: path,
        parent: path.parent,
      },
      options: options,
    };
  };
};

export const createBabelAST = (code: string) => {
  return parse(code, {
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
    errorRecovery: true,
    tokens: false,
  });
};
