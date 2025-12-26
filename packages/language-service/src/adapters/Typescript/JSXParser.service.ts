import { createCommonMappedAttribute, cx, mappedComponents } from '@native-twin/core';
import { hasOwnProperty } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import ts from 'ts-morph';
import { Regions } from '../../models/LSP.models';
import { annotatedLayer } from '../../utils/effect.utils';
import type { TypescriptModels } from './TwinDsl.models';
import { TypescriptUtils, TypescriptUtilsLive } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;

  function getRawJSXFromSource(sourceFile: ts.SourceFile) {
    const jsxElements: TypescriptModels.AnyJSXElement[] = [];
    for (const statement of sourceFile.getStatements()) {
      if (!ts.Node.isExpressionStatement(statement)) continue;
      const expression = statement.getExpression();
      if (tsUtils.is.jSXElementLike(expression)) {
        jsxElements.push(expression);
      }
    }
    return jsxElements;
  }

  function getJSXRootsFromSource(sourceFile: ts.SourceFile) {
    let jsxElements: TypescriptModels.AnyJSXElement[] = [];
    for (const statement of sourceFile.getStatements()) {
      if (ts.Node.isSpreadAssignment(statement)) {
      }
      if (!ts.Node.isVariableStatement(statement)) continue;
      jsxElements = jsxElements.concat(
        tsUtils.get.jsxElementsFromVar(statement.getDeclarationList()),
      );
    }
    return jsxElements;
  }

  function getJSXElementRegionProps(node: TypescriptModels.AnyJSXElement) {
    const tagName = getJSXNodeTagName(node).getText();
    const mappedConfig =
      mappedComponents.find((x) => x.name === tagName) ?? createCommonMappedAttribute(tagName);
    const attributes: {
      name: ts.JsxAttributeName;
      value: NonNullable<ReturnType<ts.JsxAttribute['getInitializer']>>;
      source: string;
      target: string;
      attribute: ts.JsxAttribute;
    }[] = [];
    for (const attribute of getJSXElementAttributes(node)) {
      if (!ts.Node.isJsxAttribute(attribute)) continue;
      const propName = attribute.getNameNode().getText();
      if (!hasOwnProperty.call(mappedConfig.config, propName)) continue;
      if (!attribute.getInitializer()) continue;

      attributes.push({
        name: attribute.getNameNode(),
        value: attribute.getInitializer()!,
        source: propName,
        target: mappedConfig.config[propName],
        attribute,
      });
    }
    return attributes;
  }

  function getJSXElementStatement(node: ts.Statement) {
    if (!ts.Node.isVariableStatement(node)) return null;

    const declarations = node.getDeclarationList().getDeclarations();

    for (const declaration of declarations) {
      const initializer = declaration.getInitializer();
      if (!initializer) continue;

      const returnStat = tsUtils.get.functionReturn(initializer);
      if (!returnStat) continue;

      const expression = returnStat.getExpression();
      if (expression && ts.Node.isParenthesizedExpression(expression)) {
        const maybeJSX = expression.getExpression();
        if (tsUtils.is.jSXElementLike(maybeJSX)) {
          return { jsxElement: maybeJSX, declarator: declaration.getNameNode() };
        }
      }
    }
  }

  function getJSXNode(
    node: TypescriptModels.AnyJSXElement,
    parent: Regions.JSXNode | undefined,
  ): Regions.JSXNode {
    const attributes = getJSXElementRegionProps(node).map((prop) => {
      const name = Regions.JSXAttributeName.make({
        endLine: node.getEndLineNumber(),
        startLine: node.getStartLineNumber(),
        endOffset: node.getEnd(),
        startOffset: node.getStart(),
        rawText: prop.name.getText(),
        text: prop.name.getText(),
      });
      const attrRange = {
        startOffset: prop.value.getStart(),
        endOffset: prop.value.getEnd(),
        startLine: prop.value.getStartLineNumber(),
        endLine: prop.value.getEndLineNumber(),
      };

      const attrValue = getJSXAttributeValue(prop.attribute);
      if (attrValue.expression) {
        if (
          ts.Node.isTemplateExpression(attrValue.expression) &&
          attrValue.expression.getText().startsWith('`') &&
          attrValue.expression.getText().endsWith('`')
        ) {
          attrRange.startOffset += 1;
        }
        if (
          ts.Node.isStringLiteral(attrValue.expression) &&
          (attrValue.expression.getText().startsWith('{"') ||
            attrValue.expression.getText().startsWith("{'")) &&
          (attrValue.expression.getText().endsWith('"}') ||
            attrValue.expression.getText().endsWith("'}"))
        ) {
          attrRange.startOffset += 2;
        }
      }
      const value = Regions.JSXAttributeValue.make({
        ...attrRange,
        rawText: prop.value.getText(),
        text: attrValue.originalText,
      });
      return Regions.JSXAttribute.make({
        rawText: prop.attribute.getText(),
        name,
        value,
        endLine: prop.attribute.getEndLineNumber(),
        startLine: prop.attribute.getStartLineNumber(),
        endOffset: prop.attribute.getEnd(),
        startOffset: prop.attribute.getStart(),
      });
    });

    const nodeRange = {
      endLine: node.getEndLineNumber(),
      startLine: node.getStartLineNumber(),
      endOffset: node.getEnd(),
      startOffset: node.getStart(),
    };
    const tagName = getJSXNodeTagName(node);
    const tagNameRange = {
      endLine: tagName.getEndLineNumber(),
      startLine: tagName.getStartLineNumber(),
      endOffset: tagName.getEnd(),
      startOffset: tagName.getStart(),
    };
    const result = Regions.JSXNode.make({
      ...nodeRange,
      id: JSON.stringify(nodeRange),
      parent: parent ? Regions.JSXNode.make(parent) : null,
      rawText: node.getText(),
      text: node.getText(),
      attributes,
      tag: Regions.JSXTagName.make({
        rawText: tagName.getText(),
        ...tagNameRange,
      }),
    });

    return result;
  }

  function jsxNodesToRegions(nodes: TypescriptModels.AnyJSXElement[]) {
    if (nodes.length === 0) return [];

    const regions: Regions.JSXNode[] = [];
    const nodesToVisit: ts.Node[] = [...nodes];

    const parents = new Map<ts.Node, Regions.JSXNode>();

    while (nodesToVisit.length > 0) {
      const nextNode = nodesToVisit.pop();
      if (!nextNode) break;

      if (tsUtils.is.jSXElementLike(nextNode)) {
        const jsxParent = parents.get(nextNode.getParent());
        const region = getJSXNode(nextNode, jsxParent);
        regions.push(region);
        parents.set(nextNode, region);
        nodesToVisit.push(...getJSXElementChilds(nextNode));
      }
    }
    parents.clear();

    return regions;
  }

  const getJSXElementChilds = (node: ts.Node) => {
    return pipe(
      node,
      RA.liftPredicate(tsUtils.is.jSXElementLike),
      RA.flatMap((el) => (ts.Node.isJsxElement(el) ? el.getJsxChildren() : [])),
      RA.filter((el) => ts.Node.isJsxElement(el) || ts.Node.isJsxSelfClosingElement(el)),
    );
  };

  const getJSXNodeTagName = (node: TypescriptModels.AnyJSXElement) => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getTagNameNode();
    return node.getTagNameNode();
  };

  const getJSXElementAttributes = (node: ts.Node): ts.JsxAttributeLike[] => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getAttributes();
    if (ts.Node.isJsxSelfClosingElement(node)) return node.getAttributes();
    return [];
  };

  const getJSXMappedProps = (
    node: TypescriptModels.AnyJSXElement,
  ): TypescriptModels.NodeStyledProp[] => {
    const tagName = getJSXNodeTagName(node);
    if (!tagName) return [];
    const name = tagName.getText();
    const jsxConfig =
      mappedComponents.find((x) => x.name === name) ?? createCommonMappedAttribute(name);
    const props = Object.entries(jsxConfig.config);
    const attributes = getJSXElementAttributes(node).filter((x) => ts.Node.isJsxAttribute(x)) ?? [];
    return pipe(
      props,
      RA.flatMap(([classProp, styleProp]) =>
        pipe(
          attributes,
          RA.filter((attrNode) => attrNode.getNameNode().getText() === classProp),
          RA.map(
            (attrNode): TypescriptModels.NodeStyledProp => ({
              _tag: 'NodeStyledProp',
              classProp,
              styleProp,
              node: attrNode,
              ...getJSXAttributeValue(attrNode),
            }),
          ),
        ),
      ),
    );
  };

  const getJSXAttributeValue = (
    node: ts.JsxAttribute,
  ): Pick<
    TypescriptModels.NodeStyledProp,
    'expression' | 'originalText' | 'twinCX' | 'valueTextNode'
  > => {
    const result: Pick<
      TypescriptModels.NodeStyledProp,
      'expression' | 'originalText' | 'twinCX' | 'valueTextNode'
    > = {
      originalText: '',
      twinCX: '',
      expression: null,
      valueTextNode: node.getInitializer() ?? null,
    };
    const initializer = node.getInitializer();
    if (!initializer) return result;
    if (ts.Node.isStringLiteral(initializer)) {
      result.originalText = initializer.getLiteralValue();
      result.twinCX = cx`${result.originalText}`;
      return result;
    }
    if (ts.Node.isJsxExpression(initializer)) {
      const expression = initializer.getExpression();
      if (!expression) return result;
      if (ts.Node.isStringLiteral(expression)) {
        result.originalText = expression.getLiteralValue();
        result.twinCX = cx`${result.originalText}`;
        result.valueTextNode = expression;
        return result;
      }
      if (ts.Node.isNoSubstitutionTemplateLiteral(expression)) {
        result.originalText = expression.getLiteralValue();
        result.twinCX = cx`${result.originalText}`;
        result.valueTextNode = expression;
        return result;
      }
      if (ts.Node.isTemplateExpression(expression)) {
        // result.originalText = expression.getText();
        // const literals = [expression.getHead().getText()];
        // for (const span of expression.getTemplateSpans()) {
        //   const literal = span.getLiteral();
        //   if (ts.Node.isTemplateMiddle(literal)) {
        //     literals.unshift(literal.getText());
        //   } else {
        //     span.getExpression().ge
        //     literals.push(literal.getFullText());
        //   }
        // }
        result.originalText = expression.getText();
        // literals
        //   .map((x) => x.trim())
        //   .join(' ')
        //   .replaceAll(/[`,{,},$]/g, '');
        result.twinCX = cx`${result.originalText.replaceAll(/[`,{,},$]/g, '')}`;
        result.expression = expression;
        result.valueTextNode = expression;
        return result;
      }
    }
    return result;
  };

  return {
    jsxNodesToRegions,
    getJSXRootsFromSource,
    getJSXElementStatement,
    getJSXMappedProps,
    getJSXElementChilds,
    getRawJSXFromSource,
  };
});

export interface JSXParser extends Effect.Effect.Success<typeof make> {}
export const JSXParser = Context.GenericTag<JSXParser>('JSXParser');
export const JSXParserLive = Layer.effect(JSXParser, make).pipe(
  Layer.provide(TypescriptUtilsLive),
  annotatedLayer('JSXParser'),
);
