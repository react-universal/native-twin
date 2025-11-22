import { hasOwnProperty } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import {
  DEFAULT_PLUGIN_CONFIG,
  type NativeTwinPluginConfiguration,
} from '../utils/constants.utils';

export interface LSPConfig extends NativeTwinPluginConfiguration {}
export const LSPConfig = Context.GenericTag<LSPConfig>('TypeScriptPluginConfig');

// export interface JSXFunctionDeclarationNode {
//   readonly _tag: 'JSXFunctionDeclarationNode';
//   position: number;
//   declaration: ts.FunctionDeclaration | ts.ArrowFunction;
// }

// export const jsxFnDeclarationNode = (
//   node: ts.FunctionDeclaration | ts.ArrowFunction,
// ): JSXFunctionDeclarationNode => ({
//   _tag: 'JSXFunctionDeclarationNode',
//   position: node.pos,
//   declaration: node,
// });

// export interface JSXVariableComponent {
//   _tag: 'JSXVariableComponent';
//   position: number;
//   declaration: ts.VariableDeclaration;
// }

// export const jsxVarDeclarationNode = (node: ts.VariableDeclaration): JSXVariableComponent => ({
//   _tag: 'JSXVariableComponent',
//   position: node.pos,
//   declaration: node,
// });

export const parseLSPConfigInput = (config: any): NativeTwinPluginConfiguration => {
  return {
    tsConfigPath: hasOwnProperty.call(config, 'tsConfigPath')
      ? config.tsConfigPath
      : DEFAULT_PLUGIN_CONFIG.tsConfigPath,
    rootDir: hasOwnProperty.call(config, 'rootDir')
      ? config.rootDir
      : DEFAULT_PLUGIN_CONFIG.rootDir,
    configPath: hasOwnProperty.call(config, 'configPath')
      ? config.configPath
      : DEFAULT_PLUGIN_CONFIG.configPath,
    debug: hasOwnProperty.call(config, 'debug') ? config.debug : DEFAULT_PLUGIN_CONFIG.debug,
    enable: hasOwnProperty.call(config, 'enable') ? config.enable : DEFAULT_PLUGIN_CONFIG.enable,
    functions: hasOwnProperty.call(config, 'functions')
      ? config.functions
      : DEFAULT_PLUGIN_CONFIG.functions,
    jsxAttributes: hasOwnProperty.call(config, 'jsxAttributes')
      ? config.jsxAttributes
      : DEFAULT_PLUGIN_CONFIG.jsxAttributes,
    trace: hasOwnProperty.call(config, 'trace') ? config.trace : DEFAULT_PLUGIN_CONFIG.trace,
  };
};
