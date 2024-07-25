import type { JsxOpeningElement, JsxSelfClosingElement } from 'ts-morph';
import { Node, Project } from 'ts-morph';
import type { RuntimeTW } from '@native-twin/core';
import { type JSXElementNode, createJSXElementNode } from './models/tsx.models';
import * as tsUtils from './utils/ts.utils';

const project = new Project({
  useInMemoryFileSystem: true,
});

export const twinShift = async (filename: string, code: string, twin: RuntimeTW) => {
  const ast = project.createSourceFile(filename, code, {
    overwrite: true,
  });

  const elements: JSXElementNode[] = [];
  ast.forEachDescendant((node, _traversal) => {
    if (Node.isJsxElement(node) || Node.isJsxSelfClosingElement(node)) {
      const jsxNode = createJSXElementNode(node, filename);
      if (jsxNode) {
        const entries = jsxNode.getComponentEntries(twin);
        let childElement: JsxOpeningElement | JsxSelfClosingElement | null = null;

        if (Node.isJsxElement(node)) {
          childElement = node.getOpeningElement();
        } else if (Node.isJsxSelfClosingElement(node)) {
          childElement = node;
        }

        if (childElement) {
          const styledAttribute = tsUtils.entriesToObject(jsxNode.metadata.id, entries);
          tsUtils.addAttributeToJSXElement(
            node,
            '_twinComponentSheet',
            styledAttribute.styledProp,
          );
          tsUtils.addAttributeToJSXElement(
            node,
            '_twinComponentTemplateEntries',
            `${styledAttribute.templateEntries}`,
          );
        }
        elements.push(jsxNode);
      }
    }
  });

  await ast.save();

  const result = {
    code: ast.getText(),
    full: ast.getFullText(),
    compilerNode: ast.compilerNode.text,
    components: elements,
  };

  return result;
};
