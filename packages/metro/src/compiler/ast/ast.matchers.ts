import * as t from '@babel/types';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import nodePath from 'node:path';
import { JsxElement, JsxSelfClosingElement, Node } from 'ts-morph';
import { AnyPrimitive } from '../ast.types';
import { addAttributeToBabelJSXElement } from '../babel/babel.utils';
import { JSXElementNode } from '../models/JSXElement.model';
import { createJSXAttribute } from '../ts/ts.constructors';
import { ValidJSXElementNode } from '../ts/ts.types';

export type JSXElementNodePath = Data.TaggedEnum<{
  JSXelement: { node: JsxElement };
  JSXSelfClosingElement: { node: JsxSelfClosingElement };
  BabelJSXElement: { node: t.JSXElement };
}>;

export const taggedJSXElement = Data.taggedEnum<JSXElementNodePath>();

export const getJSXNodeOpenElement = (path: JSXElementNodePath) => {
  return taggedJSXElement.$match({
    JSXelement: ({ node }) => {
      return Option.some(node.getOpeningElement());
    },
    JSXSelfClosingElement: ({ node }) => {
      return Option.some(node);
    },
    BabelJSXElement: ({ node }) => {
      return Option.some(node.openingElement);
    },
  })(path);
};

/**
 * @domain Shared Transform
 * @description get {@link JSXElementNodePath}
 */
export const getJSXElementPath = (
  node: ValidJSXElementNode | t.JSXElement,
): JSXElementNodePath => {
  if (t.isNode(node)) {
    return taggedJSXElement.BabelJSXElement({ node });
  }
  if (Node.isJsxElement(node)) {
    return taggedJSXElement.JSXelement({ node });
  }
  return taggedJSXElement.JSXSelfClosingElement({ node });
};

/**
 * @domain Shared Transform
 * @description Add a JSXAttribute to {@link JSXElementNodePath}
 */
export const addAttributeToJSXElement = (
  path: JSXElementNodePath,
  name: string,
  value: AnyPrimitive,
) => {
  taggedJSXElement.$match({
    BabelJSXElement: ({ node }) => addAttributeToBabelJSXElement(node, name, value),
    JSXelement({ node }) {
      const openingElement = node.getOpeningElement();
      if (!openingElement.getAttribute(name)) {
        openingElement.addAttribute(createJSXAttribute(name, value));
      }
    },
    JSXSelfClosingElement({ node }) {
      if (!node.getAttribute(name)) {
        node.addAttribute(createJSXAttribute(name, value));
      }
    },
  })(path);
};

/**
 * @domain Shared Transform
 * @description Create the {@link JSXElementNode} Hash id
 * */
export const createJSXElementNodeHash = (level: string, order: number, path: string) =>
  pipe(
    Hash.number(order),
    Hash.combine(Hash.string(level)),
    Hash.combine(Hash.string(nodePath.basename(path))),
  );
