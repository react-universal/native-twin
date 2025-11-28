import { createCommonMappedAttribute, cx, mappedComponents } from '@native-twin/core';
import { asArray, hasOwnProperty } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import ts from 'ts-morph';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import * as Spec from '../internal/LSPAdapterSpec';
import type { TwinDslModels } from '../models/TwinDsl.models';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;

  function extractJsxElements(declarations: ts.VariableDeclarationList) {
    return declarations.getDeclarations().flatMap((declaration) => {
      const initializer = declaration.getInitializer();
      if (!initializer) return [];
      const returnStatement = tsUtils.getFunctionReturn(initializer);
      if (!returnStatement) return [];
      const expression = returnStatement.getExpression();
      if (!returnStatement || !expression) return [];

      if (tsUtils.isJSXElementLike(expression)) return asArray(expression);

      if (ts.Node.isParenthesizedExpression(expression)) {
        const nextExpression = expression.getExpression();
        if (tsUtils.isJSXElementLike(nextExpression)) {
          return asArray(nextExpression);
        }
      }

      return [];
    });
  }

  function getJSXRootsFromSource(sourceFile: ts.SourceFile) {
    let jsxElements: TwinDslModels.AnyJSXElement[] = [];
    for (const statement of sourceFile.getStatements()) {
      if (ts.Node.isSpreadAssignment(statement)) {
      }
      if (!ts.Node.isVariableStatement(statement)) continue;
      jsxElements = jsxElements.concat(extractJsxElements(statement.getDeclarationList()));
    }
    return jsxElements;
  }

  function getJSXElementStyledProps(node: TwinDslModels.AnyJSXElement) {
    const tagName = getJSXNodeTagName(node).getText();
    const mappedConfig =
      mappedComponents.find((x) => x.name === tagName) ?? createCommonMappedAttribute(tagName);
    const styledProps: {
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

      styledProps.push({
        name: attribute.getNameNode(),
        value: attribute.getInitializer()!,
        source: propName,
        target: mappedConfig.config[propName],
        attribute,
      });
    }
    return styledProps;
  }

  function getJSXElementStatement(node: ts.Statement) {
    if (!ts.Node.isVariableStatement(node)) return null;

    const declarations = node.getDeclarationList().getDeclarations();

    for (const declaration of declarations) {
      const initializer = declaration.getInitializer();
      if (!initializer) continue;

      const returnStat = tsUtils.getFunctionReturn(initializer);
      if (!returnStat) continue;

      const expression = returnStat.getExpression();
      if (expression && ts.Node.isParenthesizedExpression(expression)) {
        const maybeJSX = expression.getExpression();
        if (tsUtils.isJSXElementLike(maybeJSX)) {
          return { jsxElement: maybeJSX, declarator: declaration.getNameNode() };
        }
      }
    }
  }

  const getNodeRange = (document: TextDocument, node: ts.Node) =>
    Spec.range(document.positionAt(node.getPos()), document.positionAt(node.getEnd()));

  function getJSXNodeRegion(
    node: TwinDslModels.AnyJSXElement,
    parent: Spec.JsxNodeRegion | undefined,
    document: TextDocument,
  ): Spec.JsxNodeRegion {
    const styledProps = getJSXElementStyledProps(node).map((prop) => {
      const attributeBinding = Spec.TwinLSPNode.createAttributeBinding({
        range: getNodeRange(document, prop.name),
        getText: () => prop.name.getText(),
      });
      const attrRange = getNodeRange(document, prop.value);

      const attrValue = getJSXAttributeValue(prop.attribute);
      if (
        attrValue.expression &&
        ts.Node.isTemplateExpression(attrValue.expression) &&
        attrValue.expression.getText().startsWith('`') &&
        attrValue.expression.getText().endsWith('`')
      ) {
        attrRange.start.character += 1;
      }
      const attributeValue = Spec.TwinLSPNode.createJsxAttributeValue({
        range: attrRange,
        getText: () => prop.value.getText(),
        rawText: prop.value.getText(),
        text: attrValue.originalText,
      });
      return Spec.TwinLSPNode.createAttributeRegion({
        getText: () => prop.attribute.getText(),
        attributeBinding,
        attributeValue,
        range: getNodeRange(document, prop.attribute),
      });
    });

    const nodeRange = getNodeRange(document, node);
    const tagName = getJSXNodeTagName(node);
    const tagNameRange = getNodeRange(document, tagName);
    return Spec.TwinLSPNode.createJsxNode({
      parent: parent ?? null,
      getText: () => node.getText(),
      range: nodeRange,
      styledProps,
      tagName: Spec.TwinLSPNode.createJsxTagName({
        getText: () => tagName.getText(),
        range: tagNameRange,
      }),
    });
  }

  function jsxNodesToRegions(nodes: TwinDslModels.AnyJSXElement[], document: TextDocument) {
    if (nodes.length === 0) return [];

    const regions: Spec.JsxNodeRegion[] = [];
    const nodesToVisit: ts.Node[] = [...nodes];

    const parents = new Map<ts.Node, Spec.JsxNodeRegion>();

    while (nodesToVisit.length > 0) {
      const nextNode = nodesToVisit.pop();
      if (!nextNode) break;

      if (tsUtils.isJSXElementLike(nextNode)) {
        const region = getJSXNodeRegion(nextNode, parents.get(nextNode.getParent()), document);
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
      RA.liftPredicate(tsUtils.isJSXElementLike),
      RA.flatMap((el) => (ts.Node.isJsxElement(el) ? el.getJsxChildren() : [])),
      RA.filter((el) => ts.Node.isJsxElement(el) || ts.Node.isJsxSelfClosingElement(el)),
    );
  };

  const getJSXNodeTagName = (node: TwinDslModels.AnyJSXElement) => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getTagNameNode();
    return node.getTagNameNode();
  };

  const getJSXElementAttributes = (node: ts.Node): ts.JsxAttributeLike[] => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getAttributes();
    if (ts.Node.isJsxSelfClosingElement(node)) return node.getAttributes();
    return [];
  };

  const getJSXMappedProps = (node: TwinDslModels.AnyJSXElement): TwinDslModels.NodeStyledProp[] => {
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
            (attrNode): TwinDslModels.NodeStyledProp => ({
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
    TwinDslModels.NodeStyledProp,
    'expression' | 'originalText' | 'twinCX' | 'valueTextNode'
  > => {
    const result: Pick<
      TwinDslModels.NodeStyledProp,
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
        result.originalText = expression.getText();
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
  };
});

export interface JSXParser extends Effect.Effect.Success<typeof make> {}
export const JSXParser = Context.GenericTag<JSXParser>('JSXParser');
export const JSXParserLive = Layer.effect(JSXParser, make);
