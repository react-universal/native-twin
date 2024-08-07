import * as t from '@babel/types';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { JsxElement, JsxSelfClosingElement, Node } from 'ts-morph';
import { mappedComponents } from '../../utils';
import { AnyPrimitive, ValidJSXElementNode } from '../types/tsCompiler.types';
import {
  addAttributesToElement,
  getBabelJSXElementAttrByName,
  getBabelJSXElementAttrs,
} from './babel.constructors';
import { createJSXAttribute } from './constructors.utils';

export type JSXElementNodePath = Data.TaggedEnum<{
  JSXelement: { node: JsxElement };
  JSXSelfClosingElement: { node: JsxSelfClosingElement };
  BabelJSXElement: { node: t.JSXElement };
}>;

export const taggedJSXElement = Data.taggedEnum<JSXElementNodePath>();

/**
 * @domain Shared Transform
 * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
 * */
export const getJSXElementConfig = (tagName: string) => {
  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return null;

  return componentConfig;
};

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

export const addAttributeToNode = (
  path: JSXElementNodePath,
  name: string,
  value: AnyPrimitive,
) => {
  taggedJSXElement.$match({
    BabelJSXElement({ node }) {
      pipe(
        node,
        (x) => getBabelJSXElementAttrs(x),
        (attrs) => getBabelJSXElementAttrByName(attrs, name),
        Option.match({
          onSome: () => void {},
          onNone: () => addAttributesToElement(node, { name, value }),
        }),
      );
    },
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
