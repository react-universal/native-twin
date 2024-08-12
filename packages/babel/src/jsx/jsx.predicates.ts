import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Predicate from 'effect/Predicate';

export const isJSXElement: Predicate.Refinement<t.Node, t.JSXElement> = (
  node,
): node is t.JSXElement => t.isJSXElement(node);

export const isJSXElementPath: Predicate.Refinement<
  NodePath<t.Node>,
  NodePath<t.JSXElement>
> = (node): node is NodePath<t.JSXElement> => node.isJSXElement();

export const isJSXAttribute: Predicate.Refinement<t.Node, t.JSXAttribute> = (
  node,
): node is t.JSXAttribute => t.isJSXAttribute(node);

export const isJSXAttributePath: Predicate.Refinement<
  NodePath<t.Node>,
  NodePath<t.JSXAttribute>
> = (node): node is NodePath<t.JSXAttribute> => node.isJSXAttribute();
