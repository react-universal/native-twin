import CodeBlock from 'code-block-writer';
import * as Array from 'effect/Array';
import { pipe } from 'effect/Function';
import type { Identifier, JsxAttributeStructure } from 'ts-morph';
import { Node, StructureKind, ts } from 'ts-morph';
import { cx } from '@native-twin/core';
import type { RuntimeComponentEntry } from '../../sheet/sheet.types';
import { type MappedComponent, mappedComponents } from '../../utils';
import type {
  AnyPrimitive,
  JSXClassnameStrings,
  JSXMappedAttribute,
  ValidJSXClassnameNodeString,
  ValidJSXElementNode,
  ValidOpeningElementNode,
} from '../twin.types';
import { isValidClassNameString, isValidTemplateLiteral } from './ts.guards';

/**
 * @domain TypeScript Transform
 * @description Get the {@link ts.ImportDeclaration} for a specified identifier
 * */
export const getImportDeclaration = (ident: Identifier) => {
  const symbol = ident.getSymbol();
  if (!symbol) return null;

  const declarations = symbol.getDeclarations().map((x) => x.compilerNode);
  const foundImport = declarations.find((x) => ts.isImportSpecifier(x));

  if (!foundImport) return null;

  const importDeclaration = foundImport.parent.parent.parent;
  if (!ts.isImportDeclaration(importDeclaration)) return null;

  return importDeclaration;
};

/**
 * @domain TypeScript Transform
 * @description Extract the JSXOpeningElement from any {@link ValidJSXElementNode}
 * */
export const getJSXElementTagName = (element: ValidJSXElementNode) => {
  const openingElement = Node.isJsxSelfClosingElement(element)
    ? element
    : element.getOpeningElement();

  const tagNameNode = openingElement.getTagNameNode();
  if (!Node.isIdentifier(tagNameNode)) return null;
  return tagNameNode;
};

/**
 * @domain TypeScript Transform
 * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
 * */
export const getJSXElementConfig = (tagName: Identifier) => {
  if (!Node.isIdentifier(tagName)) return null;

  const componentConfig = mappedComponents.find(
    (x) => x.name === tagName.compilerNode.text,
  );
  if (!componentConfig) return null;

  return componentConfig;
};

/**
 * @domain TypeScript Transform
 * @description Extract the {@link JSXMappedAttribute[]} from any {@link ValidOpeningElementNode}
 * */
export const getComponentStyledEntries = (
  openingElement: ValidOpeningElementNode,
  componentConfig: MappedComponent,
): JSXMappedAttribute[] => {
  return pipe(
    getClassNames(openingElement, componentConfig),
    Array.map((x) => ({
      ...x,
      value: getClassNameNodeString(x.value as any),
    })),
  );
};

export const getComponentID = (
  node: Node,
  filename: string,
  tagName = 'AnyTag',
) => {
  return `${filename}-${node.getStart()}-${node.getEnd()}-${tagName}`;
};

export const getIdentifierText = (node: Identifier) => node.compilerNode.text;

const getClassNameNodeString = (
  value: ValidJSXClassnameNodeString,
): JSXClassnameStrings => {
  if (Node.isStringLiteral(value)) {
    return {
      literal: value.compilerNode.text,
      templates: null,
    };
  }
  if (Node.isIdentifier(value)) {
    return {
      literal: '',
      templates: `\${${value.compilerNode.text}}`,
    };
  }
  if (Node.isCallExpression(value)) {
    return {
      literal: '',
      templates: `\${${value.compilerNode.getText()}}`,
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
export const getClassNames = (
  openingElement: ValidOpeningElementNode,
  config: MappedComponent,
) => {
  return openingElement.getAttributes().flatMap((attribute) => {
    if (!Node.isJsxAttribute(attribute)) return [];

    const name = attribute.getNameNode();
    if (!Node.isIdentifier(name)) return [];

    let value: Node | undefined = attribute.getInitializer();
    const validClassNames = Object.entries(config.config);
    const className = validClassNames.find((x) => name.compilerNode.text === x[0]);
    if (!value || !className) return [];

    if (Node.isJsxExpression(value)) {
      const expression = value.getExpression();
      if (isValidTemplateLiteral(expression)) {
        value = expression;
      }
      if (Node.isIdentifier(expression) || Node.isCallExpression(expression)) {
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

export const createJSXAttribute = (
  name: string,
  value: AnyPrimitive,
): JsxAttributeStructure => {
  if (typeof value === 'string') {
    return {
      kind: StructureKind.JsxAttribute,
      name,
      initializer: value,
    };
  }
  return {
    kind: StructureKind.JsxAttribute,
    name,
    initializer: `{${value}}`,
  };
};

export const getJSXElementAttributesNode = (node: ValidJSXElementNode) => {
  if (Node.isJsxSelfClosingElement(node)) return node.getAttributes();
  return node.getOpeningElement().getAttributes();
};

export const getJSXOpeningElement = (node: ValidJSXElementNode) => {
  if (Node.isJsxSelfClosingElement(node)) return node;
  return node.getOpeningElement();
};

/** @domain TypeScript Transform */
export const addAttributeToJSXElement = (element: Node, name: string, value: string) => {
  let childElement: ValidOpeningElementNode | null = null;

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
      let jsxValue: ts.StringLiteral | ts.NumericLiteral;
      if (!isNaN(Number(value))) {
        jsxValue = traversal.factory.createNumericLiteral(value.replace(/[{,}]/g, ''));
      } else {
        jsxValue = traversal.factory.createStringLiteral(value);
      }
      if (ts.isJsxAttribute(node)) {
        return traversal.factory.createJsxAttribute(
          traversal.factory.createIdentifier(name),
          traversal.factory.createJsxExpression(undefined, jsxValue),
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

export const entriesToObject = (id: string, entries: RuntimeComponentEntry[]) => {
  const writer = new CodeBlock();
  const templateEntries = new CodeBlock().write('{[');

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
      const templateLiteral = current.templateLiteral;
      if (templateLiteral) {
        prev.writeLine(`templateLiteral: \`${current.templateLiteral}\`,`);
        prev.writeLine(
          `templateEntries: require('@native-twin/core').tw(\`${current.templateLiteral}\`)`,
        );
        templateEntries
          .block(() => {
            templateEntries.writeLine(
              `entries: require('@native-twin/core').tw(\`${current.templateLiteral}\`),`,
            );
            templateEntries.writeLine(`id: "${id}",`);
            templateEntries.writeLine(`target: "${current.target}",`);
            templateEntries.writeLine(`prop: "${current.prop}",`);
          })
          .write(',');
      } else {
        prev.writeLine(`templateLiteral: null,`);
      }
    });
    prev.write(',');
    return prev;
  }, writer.writeLine(''));
  templateEntries.write(']}');
  records.write(']');
  records.writeLine(')}');
  return { styledProp: records.toString(), templateEntries: templateEntries.toString() };
};
