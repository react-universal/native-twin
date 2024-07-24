import type {
  JsxElement,
  JsxOpeningElement,
  JsxSelfClosingElement,
  NoSubstitutionTemplateLiteral,
  TemplateExpression,
} from 'ts-morph';
import { Node, StructureKind } from 'ts-morph';
import type { MappedComponent } from '../../utils/component.maps';
import { mappedComponents } from '../../utils/component.maps';
import type { JSXMappedAttribute } from '../models/tsx.models';

/** @domain TypeScript Transform */
export const getJSXElementAttributes = (element: JsxElement) => {
  const openingElement = element.getOpeningElement();

  const tagNameNode = openingElement.getTagNameNode();
  if (!Node.isIdentifier(tagNameNode)) return null;
  const tagName = tagNameNode.compilerNode.text;

  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return null;

  const classNames = getClassNames(openingElement, componentConfig);
  return {
    classNames,
    tagName,
    componentConfig,
  };
};

/** @domain TypeScript Transform */
export const isValidClassNameString = (
  node: Node,
): node is TemplateExpression | NoSubstitutionTemplateLiteral => {
  return Node.isStringLiteral(node) || Node.isTemplateExpression(node);
};

/** @domain TypeScript Transform */
export const getClassNames = (
  openingElement: JsxOpeningElement,
  config: MappedComponent,
) => {
  return openingElement.getAttributes().flatMap((attribute): JSXMappedAttribute[] => {
    if (!Node.isJsxAttribute(attribute)) return [];

    const name = attribute.getNameNode();
    if (!Node.isIdentifier(name)) return [];

    let value: Node | undefined = attribute.getInitializer();
    const validClassNames = Object.entries(config.config);
    const className = validClassNames.find((x) => name.compilerNode.text === x[0]);
    if (!value || !className) {
      return [];
    }
    const raw = value.compilerNode.getText();
    raw;

    if (Node.isJsxExpression(value)) {
      const expression = value.getExpression();
      if (expression && Node.isTemplateExpression(expression)) {
        value = expression;
      }
    }
    if (isValidClassNameString(value)) {
      return [
        {
          prop: className[0],
          target: className[1],
          value: value,
        },
      ];
    }
    return [];
  });
};

/** @domain TypeScript Transform */
export const isValidJSXElement = (element: Node) => {
  return Node.isJsxElement(element) || Node.isJsxSelfClosingElement(element);
};

/** @domain TypeScript Transform */
export const addAttributeToJSXElement = (element: Node, name: string, value: string) => {
  let childElement: JsxOpeningElement | JsxSelfClosingElement | null = null;

  if (Node.isJsxElement(element)) {
    childElement = element.getOpeningElement();
  } else if (Node.isJsxSelfClosingElement(element)) {
    childElement = element;
  }

  if (!childElement) return;

  childElement.addAttribute({
    kind: StructureKind.JsxAttribute,
    name: name,
    initializer: value,
  });
};
