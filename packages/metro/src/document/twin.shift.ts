import { Option } from 'effect';
import { Project } from 'ts-morph';
import type { RuntimeTW } from '@native-twin/core';
import { type ResultComponent } from './models/tsx.models';
import { getComponentEntries, getJSXElementNode } from './utils/document.maps';
import * as tsUtils from './utils/ts.utils';
import { addOrderToChilds } from './utils/tsx.utils';

const project = new Project({
  useInMemoryFileSystem: true,
});

export const twinShift = async (filename: string, code: string, twin: RuntimeTW) => {
  const ast = project.createSourceFile(filename, code, {
    overwrite: true,
  });

  const componentsList: Option.Option<ResultComponent>[] = [];
  ast.forEachDescendant((node, _traversal) => {
    const elementNode = getJSXElementNode(node);

    Option.map(elementNode, (x) => addOrderToChilds(x.jsxElement, 0));

    const componentStyles = Option.map(elementNode, ({ componentID, attributes }) => {
      const entries = getComponentEntries(twin, attributes.classNames);
      return { rawEntries: tsUtils.entriesToObject(componentID, entries), entries };
    });

    const result: Option.Option<ResultComponent> = Option.zipWith(
      elementNode,
      componentStyles,
      (elementNode, styles) => {
        tsUtils.addAttributeToJSXElement(
          elementNode.jsxElement,
          '_twinComponentSheet',
          styles.rawEntries.styledProp,
        );
        tsUtils.addAttributeToJSXElement(
          elementNode.jsxElement,
          '_twinComponentTemplateEntries',
          `${styles.rawEntries.templateEntries}`,
        );
        return {
          elementNode,
          styles,
        };
      },
    );
    componentsList.push(result);

    // if (Node.isJsxElement(node) || Node.isJsxSelfClosingElement(node)) {
    //   const tagName = tsUtils.getJSXElementTagName(node);
    //   if (tagName && !maybeReactNativeImport(tagName)) {
    //     return undefined;
    //   }
    //   const jsxNode = createJSXElementNode(node, filename);
    //   if (jsxNode) {
    //     const entries = jsxNode.getComponentEntries(twin);
    //     let childElement: JsxOpeningElement | JsxSelfClosingElement | null = null;

    //     if (Node.isJsxElement(node)) {
    //       childElement = node.getOpeningElement();
    //     } else if (Node.isJsxSelfClosingElement(node)) {
    //       childElement = node;
    //     }

    //     if (childElement) {
    //       const styledAttribute = tsUtils.entriesToObject(jsxNode.metadata.id, entries);
    //       tsUtils.addAttributeToJSXElement(
    //         node,
    //         '_twinComponentSheet',
    //         styledAttribute.styledProp,
    //       );
    //       tsUtils.addAttributeToJSXElement(
    //         node,
    //         '_twinComponentTemplateEntries',
    //         `${styledAttribute.templateEntries}`,
    //       );
    //     }
    //     elements.push(jsxNode);
    //   }
    // }
  });

  await ast.save();

  const result = {
    code: ast.getText(),
    full: ast.getFullText(),
    compilerNode: ast.compilerNode.text,
    componentsList,
  };

  return result;
};
