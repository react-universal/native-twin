import { PluginPass } from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export function visitJSXElement(path: NodePath<t.JSXElement>, _state: PluginPass) {
  path.node.openingElement.attributes;
  // console.log('PATH: ', path);
  console.log('CWD: ', process.cwd());
}
