import { PluginPass } from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export function visitJSXAttribute(path: NodePath<t.JSXAttribute>, _state: PluginPass) {
  // console.log('PATH: ', path);
  console.log('CWD: ', path);
}
