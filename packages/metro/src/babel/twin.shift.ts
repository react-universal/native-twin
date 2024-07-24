import type { JsxElement } from 'ts-morph';
import { Project, SyntaxKind } from 'ts-morph';
import { JSXElementNode } from './models/tsx.models';
import * as tsUtils from './utils/ts.utils';

const project = new Project({
  useInMemoryFileSystem: true,
});

export const twinShift = async (filename: string, code: string) => {
  const ast = project.createSourceFile(filename, code, {
    overwrite: false,
  });

  const jsxElements = ast.getDescendantsOfKind(SyntaxKind.JsxElement);

  const elements: JSXElementNode[] = [];
  for (const element of jsxElements) {
    const node = getJSXElementNode(element, filename);
    if (!node) continue;
    elements.push(node);
  }

  ast.saveSync();

  const result = {
    code: ast.getText(),
    full: ast.getFullText(),
    compilerNode: ast.compilerNode.text,
    elements,
    classNames: elements.map((x) => x.classNamesString),
  };

  return result;
};

const getJSXElementNode = (element: JsxElement, filename: string, order = 0) => {
  const jsxAttributes = tsUtils.getJSXElementAttributes(element);
  if (!jsxAttributes) return null;

  const childs = element.getDescendants();
  const childsCount = element.getChildCount();
  for (const child of childs) {
    if (!tsUtils.isValidJSXElement(child)) continue;

    if (order === 0) {
      tsUtils.addAttributeToJSXElement(child, 'isFirstChild', `{true}`);
    }
    tsUtils.addAttributeToJSXElement(child, 'ord', `{${order++}}`);
    if (order === childsCount) {
      tsUtils.addAttributeToJSXElement(child, 'isLastChild', `{true}`);
    }
  }

  return new JSXElementNode({
    element,
    ...jsxAttributes,
    filename,
    order,
  });
};
