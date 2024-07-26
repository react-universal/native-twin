import type { JsxElement, JsxSelfClosingElement } from 'ts-morph';
import { maybeReactNativeImport } from '../utils/document.maps';
import * as tsUtils from '../utils/ts.utils';

export const addOrderToChilds = (
  element: JsxElement | JsxSelfClosingElement,
  order: number,
) => {
  const childsCount = element.getChildCount();
  element.forEachChild((node) => {
    if (tsUtils.isValidJSXElement(node)) {
      const tagName = tsUtils.getJSXElementTagName(node);
      if (tagName && !maybeReactNativeImport(tagName)) {
        return undefined;
      }
      if (order === 0) {
        tsUtils.addAttributeToJSXElement(node, 'isFirstChild', `{true}`);
      }
      tsUtils.addAttributeToJSXElement(node, 'ord', `{${order++}}`);
      if (order === childsCount) {
        tsUtils.addAttributeToJSXElement(node, 'isLastChild', `{true}`);
      }
    }
  });
  return {
    childsCount,
    finalOrder: order,
  };
};
