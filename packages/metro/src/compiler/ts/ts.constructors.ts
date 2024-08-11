import CodeBlock from 'code-block-writer';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { Identifier, JsxAttributeStructure } from 'ts-morph';
import { Node, StructureKind, ts } from 'ts-morph';
import { cx } from '@native-twin/core';
import type { RuntimeComponentEntry } from '@native-twin/css/jsx';
import { type MappedComponent } from '../../utils';
import type { AnyPrimitive, JSXClassnameStrings, JSXMappedAttribute } from '../ast.types';
import { getJSXElementConfig } from '../ast/ast.utils';
import { expressionFactory } from '../ast/writer.factory';
import type {
  ValidJSXClassnameNodeString,
  ValidJSXClassnameTemplate,
  ValidJSXElementNode,
  ValidOpeningElementNode,
} from './ts.types';

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

export const getJSXRuntimeData = (
  node: ValidJSXElementNode,
  openingElement: ValidOpeningElementNode,
): JSXMappedAttribute[] => {
  const styledConfig = pipe(
    node,
    getJSXElementTagName,
    Option.fromNullable,
    Option.flatMap((x) => Option.fromNullable(getJSXElementConfig(x.compilerNode.text))),
  );
  return Option.map(styledConfig, (config) => {
    return getComponentStyledEntries(openingElement, config);
  }).pipe(Option.getOrElse(() => []));
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
  const { writer, identifier, array } = expressionFactory(new CodeBlock());
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
              `entries: require('@native-twin/core').tw(${x.templateLiteral}),`,
            );
            templateEntries.writer.write(`templateLiteral: ${x.templateLiteral},`);
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
            entries: x.entries,
            rawSheet: x.rawSheet,
          };
        }),
      );
      // entries.forEach((x) => {
      //   writer.write('[');
      //   writer.block(() => {
      //     writer.write('templateLiteral: ');
      //     identifier('null,');
      //     writer.write('prop: ').write(`"${x.prop}",`);
      //     writer.write('target: ').write(`"${x.target}",`);
      //     writer.write('entries: ');
      //     writer.write('[');
      //     // x.entries.forEach((x) => identifier(`globalStyles.get("${x.className}"),`));

      //     identifier('].filter(Boolean),');
      //     writer.write('rawSheet: ');
      //     object(x.rawSheet).write(',');
      //   });
      //   identifier(']');
      // });
      identifier(`)`);
    })
    .toString();
  return {
    styledProp,
    templateEntries: templateEntries.writer.toString(),
  };
};

/** @domain TypeScript Transform */
export const isValidClassNameString = (
  node?: Node,
): node is ValidJSXClassnameNodeString => {
  return (
    Node.isStringLiteral(node) ||
    Node.isTemplateExpression(node) ||
    Node.isNoSubstitutionTemplateLiteral(node) ||
    Node.isIdentifier(node) ||
    Node.isCallExpression(node)
  );
};

export const isValidTemplateLiteral = (
  node?: Node,
): node is ValidJSXClassnameTemplate => {
  return Node.isTemplateExpression(node) || Node.isNoSubstitutionTemplateLiteral(node);
};

/**
 * @domain TypeScript Transform
 * */
export const isValidJSXElement = (element: Node): element is ValidJSXElementNode => {
  return Node.isJsxElement(element) || Node.isJsxSelfClosingElement(element);
};
