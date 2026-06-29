import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';

export namespace BabelTypes {
  export type JSXElementBabelPath = NodePath<JSXElementNode>;
  export type BabelFileAst = ParseResult<t.File>;
  export type JSXElementNode = t.JSXElement;
  export type JSXElementPath = NodePath<t.JSXElement>;
  export type AnyNode = t.Node;
  export type AnyNodePath = NodePath<AnyNode>;
  export type JSXOpeningElementPath = NodePath<t.JSXOpeningElement>;
  export type JSXElementAttribute = t.JSXAttribute;
  export type JSXElementAttributePath = NodePath<t.JSXAttribute>;
}
