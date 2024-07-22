import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { addJsxAttribute } from './jsx.attribute';

export const visitJSXElement = (element: NodePath<t.JSXElement>) => {
  addOrderToJSXChilds(element.node);
};

const addOrderToJSXChilds = (element: t.JSXElement) => {
  const childrenCount = countJSXElementChilds(element);
  let ord = 0;
  element.children = element.children.map((x) => {
    if (!t.isJSXElement(x)) return x;
    if (ord === 0) {
      addJsxAttribute(x, 'firstChild', true);
    }
    addJsxAttribute(x, 'ord', ++ord);
    if (ord === childrenCount) {
      addJsxAttribute(x, 'lastChild', true);
    }
    return x;
  });
};

const countJSXElementChilds = (element: t.JSXElement) => {
  return element.children.filter((x) => t.isJSXElement(x)).length;
};


