import CodeBlock from 'code-block-writer';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import type { Identifier, JsxAttributeStructure } from 'ts-morph';
import { Node, StructureKind, ts } from 'ts-morph';
import { cx } from '@native-twin/core';
import type { RuntimeComponentEntry } from '@native-twin/css/jsx';
import { mappedComponents, type MappedComponent } from '../../utils';
import type {
  AnyPrimitive,
  JSXClassnameStrings,
  JSXMappedAttribute,
  ValidJSXClassnameNodeString,
  ValidJSXElementNode,
  ValidOpeningElementNode,
} from '../twin.types';
import { isValidClassNameString, isValidTemplateLiteral } from './ast.guards';
import { expressionFactory } from './writer.factory';

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
//  * @domain TypeScript Transform
//  * @description Extract the {@link JSXMappedAttribute[]} from any {@link ValidOpeningElementNode}
//  * */
export const getComponentStyledEntries = (
  openingElement: ValidOpeningElementNode,
  componentConfig: MappedComponent,
): JSXMappedAttribute[] => {
  return pipe(
    getClassNames(openingElement, componentConfig),
    RA.map((x) => ({
      ...x,
      value: getClassNameNodeString(x.value as any),
    })),
  );
};

export const getComponentID = (node: ValidJSXElementNode, filename: string) => {
  const tagName = getJSXElementTagName(node)?.compilerNode.text;
  return `${filename}-${node.getStart()}-${node.getEnd()}-${tagName ?? 'Unknown'}`;
};

// export const getIdentifierText = (node: Identifier) => node.compilerNode.text;

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
const getClassNames = (
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

export const entriesToObject = (id: string, entries: RuntimeComponentEntry[]) => {
  const { writer, array, identifier } = expressionFactory(new CodeBlock());
  const templateEntries = expressionFactory(new CodeBlock());
  templateEntries.writer.block(() => {
    templateEntries.writer.write('[');
    entries
      .filter((x) => x.templateLiteral)
      .forEach((x) => {
        if (x.templateLiteral) {
          templateEntries.writer.block(() => {
            templateEntries.writer.writeLine(`id: "${id}",`);
            templateEntries.writer.writeLine(`target: "${x.target}",`);
            templateEntries.writer.writeLine(`prop: "${x.prop}",`);
            templateEntries.writer.writeLine(
              `entries: require('@native-twin/core').tw(\`${x.templateLiteral}\`),`,
            );
            templateEntries.writer.write(`templateLiteral: \`${x.templateLiteral}\`,`);
          });
        }
      });
    templateEntries.writer.write(']');
  });
  const styledProp = writer
    .block(() => {
      identifier(`require('@native-twin/jsx').StyleSheet.registerComponent("${id}", `);
      array(
        entries.map((x) => {
          return {
            templateLiteral: null,
            prop: x.prop,
            target: x.target,
            rawEntries: x.rawEntries,
            entries: x.rawSheet,
            metadata: x.metadata,
          };
        }),
      );
      identifier(`)`);
    })
    .toString();
  return {
    styledProp,
    templateEntries: templateEntries.writer.toString(),
  };
};
