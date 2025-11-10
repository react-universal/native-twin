import { mappedComponents } from '@native-twin/compiler';
import { cx } from '@native-twin/core';
import * as Array from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import ts from 'ts-morph';
import type { TwinDslModels } from './TwinDsl.models';

const make = Effect.gen(function* () {
  const isFunction = (node: ts.Node) =>
    Predicate.compose(ts.Node.isFunctionExpression, ts.Node.isArrowFunction)(node);

  const getNodeSourceFile = (node: ts.Node) => node.getSourceFile();
  const getNodeOffset = (node: ts.Node): number => node.getPos();

  const findNodeAtOffset = (node: ts.Node, offset: number): Option.Option<ts.Node> =>
    Option.fromNullable(node.getChildAtPos(offset));

  const getJSXRoots = (node: ts.SourceFile) => node.getStructure();

  const getFunctionReturn = (node: ts.Node) => {
    if (ts.Node.isFunctionExpression(node) || ts.Node.isArrowFunction(node)) {
      for (const child of node.getStatements()) {
        if (ts.Node.isReturnStatement(child)) return child;
      }
    }
  };

  const getJSXElementStatement = (node: ts.Statement) => {
    if (ts.Node.isVariableStatement(node)) {
      const declarations = node.getDeclarations();
      for (const declaration of declarations) {
        const initializer = declaration.getInitializer();
        if (!initializer) continue;
        const returnStat = getFunctionReturn(initializer);
        if (!returnStat) continue;
        const expression = returnStat.getExpression();
        if (ts.Node.isParenthesizedExpression(expression)) {
          const maybeJSX = expression.getExpression();
          if (ts.Node.isJsxElement(maybeJSX)) {
            return { jsxElement: maybeJSX, declarator: declaration.getNameNode() };
          }
        }
      }
    }
    return null;
  };

  const getJSXElementChilds = (node: ts.Node) =>
    pipe(
      node.asKind(ts.SyntaxKind.JsxElement) ?? node.asKind(ts.SyntaxKind.JsxSelfClosingElement),
      Array.liftPredicate(Predicate.isNotNullable),
      Array.flatMap((el) => (ts.Node.isJsxElement(el) ? el.getJsxChildren() : el.getChildren())),
      Array.filter((el) => ts.Node.isJsxElement(el) || ts.Node.isJsxSelfClosingElement(el)),
    );

  const getTwinJSXNode = (
    node: TwinDslModels.AnyJSXElement,
    jsxParent: TwinDslModels.JSXNode | null = null,
  ): Effect.Effect<TwinDslModels.JSXNode> =>
    Effect.gen(function* () {
      const tagName = getJSXNodeTagName(node).getText();
      const id = getJSXNodeTagName(node)
        .getText()
        .concat(jsxParent?.id ?? '');
      const result: TwinDslModels.JSXNode = {
        _tag: 'JSXNode',
        id,
        childs: [],
        index: node.getChildIndex(),
        node,
        styledProps: getJSXMappedProps(node),
        tagName,
        parent: jsxParent,
      };
      result.childs = yield* Effect.suspend(() =>
        Effect.all(getJSXElementChilds(node).map((_) => getTwinJSXNode(_, result))),
      );

      return result;
    });

  const extractSourceInfo = (source: ts.SourceFile) => {
    const exports = source.getExportDeclarations();
    const declarations: ts.Node[] = [...source.getVariableDeclarations(), ...source.getFunctions()];
    const functions = source.getFunctions();
    const outsideNodes = source.getReferencingNodesInOtherSourceFiles();
    return { exports, declarations, functions, outsideNodes };
  };

  const getNodeDebugDetails = (node: ts.Node) => {
    let name = 'Unknown';
    if (ts.Node.hasName(node)) {
      name = node.getName();
    }
    if (isJSXElementLike(node)) {
      name = getJSXNodeTagName(node)?.getText() ?? node.print();
    }
    if (ts.Node.isJsxSelfClosingElement(node)) {
      name = node.compilerNode.tagName.getText();
    }
    return {
      name,
      kind: node.getKind(),
      kindName: node.getKindName(),
      index: node.getChildIndex(),
    };
  };

  const getNodeDependencies = (node: ts.Node) => {
    return node.getProject().getLanguageService().findReferences(node);
  };

  const getVariableNameExpression = (node: ts.Node) =>
    ts.Node.isPropertyDeclaration(node) || ts.Node.isVariableDeclaration(node)
      ? node.getInitializer()
      : ts.Node.isExpression(node)
        ? node
        : undefined;

  const getJSXNodeTwinInfo = (node: TwinDslModels.AnyJSXElement) => {
    const tagName = getJSXNodeTagName(node);
    const childs = getJSXElementChilds(node);
    const dependencies = getNodeDependencies(node);

    return { tagName, childs, dependencies };
  };

  const isJSXElementLike = (node: ts.Node) =>
    Predicate.or(ts.Node.isJsxElement, ts.Node.isJsxSelfClosingElement)(node);

  const getJSXNodeTagName = (node: TwinDslModels.AnyJSXElement) => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getTagNameNode();
    return node.getTagNameNode();
  };

  const getJSXElementAttributes = (node: ts.Node) => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getAttributes();
    if (ts.Node.isJsxSelfClosingElement(node)) return node.getAttributes();
    return [];
  };

  const getJSXMappedProps = (node: TwinDslModels.AnyJSXElement): TwinDslModels.NodeStyledProp[] => {
    const tagName = getJSXNodeTagName(node);
    if (!tagName) return [];
    const name = tagName.getText();
    const jsxConfig = mappedComponents.find((x) => x.name === name);
    const props = Object.entries(jsxConfig?.config ?? {});
    const attributes = getJSXElementAttributes(node).filter((x) => ts.Node.isJsxAttribute(x));
    return props.flatMap(([classProp, styleProp]) =>
      attributes
        .filter((node) => node.getNameNode().getText() === classProp)
        .map(
          (node): TwinDslModels.NodeStyledProp => ({
            _tag: 'NodeStyledProp',
            classProp,
            styleProp,
            node,
            value: getJSXAttributeValue(node),
          }),
        ),
    );
  };

  const getJSXAttributeValue = (node: ts.JsxAttribute): TwinDslModels.NodeStyledProp['value'] => {
    const initializer = node.getInitializer();
    if (!initializer) return null;
    if (ts.Node.isStringLiteral(initializer)) {
      return { literal: cx`${initializer.getLiteralValue()}`, expression: null };
    }
    if (ts.Node.isJsxExpression(initializer)) {
      const expression = initializer.getExpression();
      if (!expression) return null;
      if (ts.Node.isStringLiteral(expression)) {
        return { literal: cx`${expression.getLiteralValue()}`, expression: null };
      }
      if (ts.Node.isNoSubstitutionTemplateLiteral(expression)) {
        return { literal: cx`${expression.getLiteralText()}`, expression: null };
      }
      if (ts.Node.isTemplateExpression(expression)) {
        const literals = [expression.getHead().getLiteralText()];
        const expressions: ts.Expression[] = [];
        for (const span of expression.getTemplateSpans()) {
          const literal = span.getLiteral();
          if (ts.Node.isTemplateMiddle(literal)) {
            literals.push(literal.compilerNode.text);
          } else {
            literals.push(literal.compilerNode.text);
          }
          const expression = span.getExpression();
          expressions.push(expression);
        }
        return { literal: cx`${literals.map((x) => x.trim()).join(' ')}`, expression };
      }
    }
    return null;
  };

  return yield* Effect.succeed({
    isFunction,
    getNodeDependencies,
    getNodeDebugDetails,
    getJSXElementStatement,
    getTwinJSXNode,
    getVariableNameExpression,
    getJSXElementChilds,
    extractSourceInfo,
    getNodeSourceFile,
    findNodeAtOffset,
    getJSXRoots,
    getNodeOffset,
    getJSXNodeTwinInfo,
    getJSXMappedProps,
    isJSXElementLike,
    getJSXNodeTagName,
  });
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make);
