import CodeBlock from 'code-block-writer';
import * as Array from 'effect/Array';
import { pipe } from 'effect/Function';
import type {
  JsxElement,
  JsxOpeningElement,
  JsxSelfClosingElement,
  NoSubstitutionTemplateLiteral,
  StringLiteral,
  TemplateExpression,
} from 'ts-morph';
import { Node, StructureKind, ts } from 'ts-morph';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import { cx } from '@native-twin/core';
import type { MappedComponent } from '../../utils/component.maps';
import { mappedComponents } from '../../utils/component.maps';
import type { JSXMappedAttribute } from '../models/tsx.models';

/** @domain TypeScript Transform */
export const getJSXElementAttributes = (element: JsxElement | JsxSelfClosingElement) => {
  const openingElement = Node.isJsxSelfClosingElement(element)
    ? element
    : element.getOpeningElement();

  const tagNameNode = openingElement.getTagNameNode();
  if (!Node.isIdentifier(tagNameNode)) return null;
  const tagName = tagNameNode.compilerNode.text;

  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return null;

  const classNames: JSXMappedAttribute[] = pipe(
    getClassNames(openingElement, componentConfig),
    Array.map((x) => ({
      ...x,
      value: getClassNameNodeString(x.value as any),
    })),
  );
  return {
    classNames,
    tagName,
    componentConfig,
  };
};

const getClassNameNodeString = (
  value: StringLiteral | TemplateExpression | NoSubstitutionTemplateLiteral,
) => {
  if (Node.isStringLiteral(value)) {
    return {
      literal: value.compilerNode.text,
      templates: null,
    };
  }
  if (Node.isNoSubstitutionTemplateLiteral(value)) {
    return {
      literal: value.compilerNode.text.replace(/\n/g, ' ').trim(),
      templates: null,
    };
  }
  const head = value.getHead();
  const spans = value.getTemplateSpans();
  const cooked = cx`${head.compilerNode.text.replace(/\n\s+/g, ' ').trim()}`;
  const cookedSpans = spans.map((x) => x.compilerNode.expression.getText());

  return {
    literal: cooked,
    templates: `\${${cookedSpans}}`,
  };
};

/** @domain TypeScript Transform */
export const isValidClassNameString = (
  node: Node,
): node is TemplateExpression | NoSubstitutionTemplateLiteral | StringLiteral => {
  return (
    Node.isStringLiteral(node) ||
    Node.isTemplateExpression(node) ||
    Node.isNoSubstitutionTemplateLiteral(node)
  );
};

/** @domain TypeScript Transform */
export const getClassNames = (
  openingElement: JsxOpeningElement | JsxSelfClosingElement,
  config: MappedComponent,
) => {
  return openingElement.getAttributes().flatMap((attribute) => {
    if (!Node.isJsxAttribute(attribute)) return [];

    const name = attribute.getNameNode();
    if (!Node.isIdentifier(name)) return [];

    let value: Node | undefined = attribute.getInitializer();
    const validClassNames = Object.entries(config.config);
    const className = validClassNames.find((x) => name.compilerNode.text === x[0]);
    if (!value || !className) {
      return [];
    }

    if (Node.isJsxExpression(value)) {
      const expression = value.getExpression();
      if (
        Node.isTemplateExpression(expression) ||
        Node.isNoSubstitutionTemplateLiteral(expression)
      ) {
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

  const attribute = childElement.getAttribute(name);
  if (attribute) {
    attribute.transform((traversal) => {
      const node = traversal.visitChildren();
      if (ts.isJsxAttribute(node)) {
        return traversal.factory.createJsxAttribute(
          traversal.factory.createIdentifier(name),
          traversal.factory.createJsxExpression(
            undefined,
            traversal.factory.createNumericLiteral(value.replace(/[{,}]/g, '')),
          ),
        );
      }
      return node;
    });
  } else {
    childElement.addAttribute({
      kind: StructureKind.JsxAttribute,
      name: name,
      initializer: value,
    });
  }
};

export const splitClasses = (classes: string) => classes.split(/\s+/g);

export const entriesToObject = (id: string, entries: RuntimeComponentEntry[]) => {
  const writer = new CodeBlock();
  writer
    .write(`{require('@native-twin/jsx').StyleSheet.registerComponent(`)
    .write(`"${id}",`);
  writer.write('[');
  const records = entries.reduce((prev, current) => {
    prev.block(() => {
      prev.writeLine(`entries: ${JSON.stringify(current.entries)},`);
      prev.writeLine(`metadata: ${JSON.stringify(current.metadata)},`);
      prev.writeLine(`prop: "${current.prop}",`);
      prev.writeLine(`target: "${current.target}",`);
      const literal = current.templateLiteral;
      if (literal) {
        prev.writeLine(`templateLiteral: \`${current.templateLiteral}\`,`);
      } else {
        prev.writeLine(`templateLiteral: null,`);
      }
    });
    prev.write(',');
    return prev;
  }, writer.writeLine(''));
  records.write(']');
  records.writeLine(')}');
  return records.toString();
};
