import { createCommonMappedAttribute, cx, mappedComponents } from '@native-twin/core';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as ts from 'typescript';
import { JSXNode, type TwinDslModels } from './TwinDsl.models';

const make = Effect.gen(function* () {
  const isFunction = (node: ts.Node) =>
    Predicate.compose(ts.isFunctionExpression, ts.isArrowFunction)(node);

  const getNodeSourceFile = (node: ts.Node) => node.getSourceFile();
  const getNodeOffset = (node: ts.Node): number => node.pos;

  const findNodeAtOffset = (node: ts.Node, offset: number): Option.Option<ts.Node> =>
    Option.fromNullable(node.getChildAt(offset));

  const getFunctionReturn = (node: ts.Node) => {
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      if (ts.isBlock(node.body)) {
        for (const child of node.body.statements) {
          if (ts.isReturnStatement(child)) return child;
        }
      }
    }
  };

  const getJSXElementStatement = (node: ts.Statement) => {
    if (ts.isVariableStatement(node)) {
      const declarations = node.declarationList.declarations;
      for (const declaration of declarations) {
        const initializer = declaration.initializer;
        if (!initializer) continue;
        const returnStat = getFunctionReturn(initializer);
        if (!returnStat) continue;
        const expression = returnStat.expression;
        if (expression && ts.isParenthesizedExpression(expression)) {
          const maybeJSX = expression.expression;
          if (ts.isJsxElement(maybeJSX)) {
            return { jsxElement: maybeJSX, declarator: declaration.name };
          }
        }
      }
    }
    return null;
  };

  const getJSXElementChilds = (node: ts.Node) =>
    pipe(
      ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) ? node : null,
      RA.liftPredicate(Predicate.isNotNullable),
      RA.flatMap((el) =>
        ts.isJsxElement(el) ? el.children : el.getChildren(node.getSourceFile()),
      ),
      RA.filter((el) => ts.isJsxElement(el) || ts.isJsxSelfClosingElement(el)),
    );

  const getTwinJSXNode = (
    node: TwinDslModels.AnyJSXElement,
    jsxParent: JSXNode | null = null,
  ): Effect.Effect<JSXNode> =>
    Effect.gen(function* () {
      const tagName = getJSXNodeTagName(node).getText();
      const styledProps = getJSXMappedProps(node);
      const result = new JSXNode({ node, styledProps, tagName, parent: jsxParent });
      result.childs = yield* Effect.suspend(() =>
        Effect.all(getJSXElementChilds(node).map((_) => getTwinJSXNode(_, result))),
      );

      return result;
    });

  const extractSourceInfo = (source: ts.SourceFile) => {
    const exports = source.statements.filter((x) => ts.isExportDeclaration(x));
    const declarations: ts.Node[] = [
      ...source.statements.filter((x) => ts.isVariableDeclaration(x)),
      ...source.statements.filter((x) => ts.isFunctionDeclaration(x)),
    ];
    const functions = source.statements.filter((x) => ts.isFunctionDeclaration(x));
    const outsideNodes = source.referencedFiles;
    return { exports, declarations, functions, outsideNodes };
  };

  const getNodeDebugDetails = (node: ts.Node) => {
    let name = 'Unknown';
    if (ts.isBindingName(node)) {
      name = node.getText();
    }
    if (isJSXElementLike(node)) {
      name = getJSXNodeTagName(node)?.getText() ?? node.getText();
    }
    if (ts.isJsxSelfClosingElement(node)) {
      name = node.tagName.getText();
    }
    return {
      name,
      kind: node.kind,
      kindName: `${node.kind}`,
      index: node.parent.getChildren().indexOf(node),
    };
  };

  // const getNodeDependencies = (node: ts.Node) => {
  //   return node.getSourceFile.getLanguageService().findReferences(node);
  // };

  const getVariableNameExpression = (node: ts.Node) =>
    ts.isPropertyDeclaration(node) || ts.isVariableDeclaration(node)
      ? node.initializer
      : ts.isExpression(node)
        ? node
        : undefined;

  const getJSXNodeTwinInfo = (node: TwinDslModels.AnyJSXElement) => {
    const tagName = getJSXNodeTagName(node);
    const childs = getJSXElementChilds(node);
    // const dependencies = getNodeDependencies(node);

    return { tagName, childs };
  };

  const isJSXElementLike = (node: ts.Node) =>
    Predicate.or(ts.isJsxElement, ts.isJsxSelfClosingElement)(node);

  const getJSXNodeTagName = (node: TwinDslModels.AnyJSXElement) => {
    if (ts.isJsxElement(node)) return node.openingElement.tagName;
    return node.tagName;
  };

  const getJSXElementAttributes = (node: ts.Node): ts.NodeArray<ts.JsxAttributeLike> => {
    if (ts.isJsxElement(node)) return node.openingElement.attributes.properties;
    if (ts.isJsxSelfClosingElement(node)) return node.attributes.properties;
    return ts.factory.createNodeArray();
  };

  const getJSXMappedProps = (node: TwinDslModels.AnyJSXElement): TwinDslModels.NodeStyledProp[] => {
    const tagName = getJSXNodeTagName(node);
    if (!tagName) return [];
    const name = tagName.getText();
    const jsxConfig =
      mappedComponents.find((x) => x.name === name) ?? createCommonMappedAttribute(name);
    const props = Object.entries(jsxConfig.config);
    const attributes = getJSXElementAttributes(node).filter((x) => ts.isJsxAttribute(x)) ?? [];
    return props.flatMap(([classProp, styleProp]) =>
      attributes
        .filter((attrNode) => attrNode.name.getText() === classProp)
        .map(
          (attrNode): TwinDslModels.NodeStyledProp => ({
            _tag: 'NodeStyledProp',
            classProp,
            styleProp,
            node: attrNode,
            ...getJSXAttributeValue(attrNode),
          }),
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
      valueTextNode: node.initializer ?? null,
    };
    const initializer = node.initializer;
    if (!initializer) return result;
    if (ts.isStringLiteral(initializer)) {
      result.originalText = initializer.text;
      result.twinCX = cx`${result.originalText}`;
      return result;
    }
    if (ts.isJsxExpression(initializer)) {
      const expression = initializer.expression;
      if (!expression) return result;
      if (ts.isStringLiteral(expression)) {
        result.originalText = expression.text;
        result.twinCX = cx`${result.originalText}`;
        result.valueTextNode = expression;
        return result;
      }
      if (ts.isNoSubstitutionTemplateLiteral(expression)) {
        result.originalText = expression.text;
        result.twinCX = cx`${result.originalText}`;
        result.valueTextNode = expression;
        return result;
      }
      if (ts.isTemplateExpression(expression)) {
        const literals = [expression.head.text];
        const expressions: ts.Expression[] = [];
        for (const span of expression.templateSpans) {
          const literal = span.literal;
          if (ts.isTemplateMiddle(literal)) {
            literals.push(literal.text);
          } else {
            literals.push(literal.text);
          }
          const expression = span.expression;
          expressions.push(expression);
        }
        result.originalText = literals.map((x) => x.trim()).join(' ');
        result.twinCX = cx`${result.originalText}`;
        result.expression = expression;
        result.valueTextNode = expression;
        return result;
      }
    }
    return result;
  };

  return {
    isFunction,
    getNodeDebugDetails,
    getJSXElementStatement,
    getTwinJSXNode,
    getVariableNameExpression,
    getJSXElementChilds,
    extractSourceInfo,
    getNodeSourceFile,
    findNodeAtOffset,
    getNodeOffset,
    getJSXNodeTwinInfo,
    getJSXMappedProps,
    isJSXElementLike,
    getJSXNodeTagName,
    flattenDeclarators,
  };

  function flattenDeclarators(declarator: TwinDslModels.NodeJSXDeclarator) {
    const rootPath = `${declarator.filename}-${declarator.identifier}`;
    const mapped = new Map(flattenNode(declarator.jsxElement, [rootPath]));
    return mapped;

    function flattenNode(node: JSXNode, currentPath: string[]): [string, JSXNode][] {
      const nextPath = [...currentPath, `${node.index}`];
      const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
      return [[nextPath.join('-').concat(node.id), node], ...childs];
    }
  }
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make);
