import * as Data from 'effect/Data';
import {
  type JsxElement,
  type JsxElementStructure,
  type JsxSelfClosingElement,
  type JsxSelfClosingElementStructure,
} from 'ts-morph';
import type {
  RuntimeComponentEntry,
  StyledPropEntries,
} from '@native-twin/babel/build/jsx';
import type { RuntimeTW } from '@native-twin/core';
import { getRuleSelectorGroup } from '@native-twin/css';
import type { MappedComponent } from '../../utils/component.maps';
import * as tsUtils from '../utils/ts.utils';

/** @domain TypeScript Transform */
export interface JSXMappedAttribute {
  prop: string;
  value: {
    literal: string;
    templates: string | null;
  };
  target: string;
}

/** @domain TypeScript */
export class JSXElementNode extends Data.Class<{
  element: JsxElementStructure | JsxSelfClosingElementStructure;
  readonly metadata: {
    readonly tagName: string;
    readonly filename: string;
    readonly id: string;
  };
  readonly componentConfig: MappedComponent;
  readonly mappedAttributes: JSXMappedAttribute[];
  readonly order: number;
}> {
  getComponentEntries(tw: RuntimeTW): RuntimeComponentEntry[] {
    const component = this.mappedAttributes.map((x): RuntimeComponentEntry => {
      const classNames = x.value.literal;

      const entries = tw(x.value.literal);
      return {
        prop: x.prop,
        target: x.target,
        templateLiteral: x.value.templates,
        metadata: getEntryGroups({
          classNames: classNames,
          entries,
          expression: x.value.templates,
          prop: x.prop,
          target: x.target,
        }),
        entries,
      };
    });
    return component;
  }

  // MARK: - Functions
}

function getEntryGroups(
  classProps: StyledPropEntries,
): RuntimeComponentEntry['metadata'] {
  return classProps.entries
    .map((x) => [x.className, ...x.selectors])
    .reduce(
      (prev, current): RuntimeComponentEntry['metadata'] => {
        const selector = getRuleSelectorGroup(current);
        if (current.includes('group')) {
          prev.isGroupParent = true;
        }
        if (selector === 'group') {
          prev.hasGroupEvents = true;
        }
        if (selector === 'pointer') {
          prev.hasPointerEvents = true;
        }

        return prev;
      },
      {
        hasAnimations: false,
        hasGroupEvents: false,
        hasPointerEvents: false,
        isGroupParent: false,
      } as RuntimeComponentEntry['metadata'],
    );
}

export const createJSXElementNode = (
  element: JsxElement | JsxSelfClosingElement,
  filename: string,
  order = 0,
) => {
  const jsxAttributes = tsUtils.getJSXElementAttributes(element);
  if (!jsxAttributes) return null;

  addOrderToChilds(element, order);

  const id = `${filename}-${element.getStart()}-${element.getEnd()}-${jsxAttributes.tagName}`;
  tsUtils.addAttributeToJSXElement(element, '_twinComponentID', `"${id}"`);

  return new JSXElementNode({
    element: element.getStructure(),
    metadata: {
      filename,
      tagName: jsxAttributes.tagName,
      id,
    },
    mappedAttributes: jsxAttributes.classNames,
    componentConfig: jsxAttributes.componentConfig,
    order,
  });
};

export const addOrderToChilds = (
  element: JsxElement | JsxSelfClosingElement,
  order: number,
) => {
  const childsCount = element.getChildCount();
  element.forEachChild((node) => {
    if (tsUtils.isValidJSXElement(node)) {
      if (order === 0) {
        tsUtils.addAttributeToJSXElement(node, 'isFirstChild', `{true}`);
      }
      tsUtils.addAttributeToJSXElement(node, 'ord', `{${order++}}`);
      if (order === childsCount) {
        tsUtils.addAttributeToJSXElement(node, 'isLastChild', `{true}`);
      }
    }
  });
};
