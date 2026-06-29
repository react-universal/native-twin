import type { TwinConfigOptions } from '@native-twin/language-service';
import * as Context from 'effect/Context';
import type ts from 'typescript';

export interface LSPConfig extends TwinConfigOptions {}

export interface TypeScriptPluginConfig extends TwinConfigOptions {}
export const TypeScriptPluginConfig =
  Context.GenericTag<TypeScriptPluginConfig>('TypeScriptPluginConfig');

export interface JSXFunctionDeclarationNode {
  readonly _tag: 'JSXFunctionDeclarationNode';
  position: number;
  declaration: ts.FunctionDeclaration | ts.ArrowFunction;
}

export const jsxFnDeclarationNode = (
  node: ts.FunctionDeclaration | ts.ArrowFunction,
): JSXFunctionDeclarationNode => ({
  _tag: 'JSXFunctionDeclarationNode',
  position: node.pos,
  declaration: node,
});

export interface JSXVariableComponent {
  _tag: 'JSXVariableComponent';
  position: number;
  declaration: ts.VariableDeclaration;
}

export const jsxVarDeclarationNode = (node: ts.VariableDeclaration): JSXVariableComponent => ({
  _tag: 'JSXVariableComponent',
  position: node.pos,
  declaration: node,
});
