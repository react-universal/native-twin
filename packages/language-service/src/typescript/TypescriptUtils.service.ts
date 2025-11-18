import { cx, mappedComponents } from '@native-twin/core';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';
import { TwinParserContext } from '../twin/TwinParser.service';
import { JSXNode, type TwinDslModels } from './TwinDsl.models';

const make = Effect.gen(function* () {
  const twinParser = yield* TwinParserContext;
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
      RA.liftPredicate(Predicate.isNotNullable),
      RA.flatMap((el) => (ts.Node.isJsxElement(el) ? el.getJsxChildren() : el.getChildren())),
      RA.filter((el) => ts.Node.isJsxElement(el) || ts.Node.isJsxSelfClosingElement(el)),
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
        .filter((attrNode) => attrNode.getNameNode().getText() === classProp)
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
  ): Pick<TwinDslModels.NodeStyledProp, 'expression' | 'originalText' | 'twinCX'> => {
    const result: Pick<TwinDslModels.NodeStyledProp, 'expression' | 'originalText' | 'twinCX'> = {
      originalText: '',
      twinCX: '',
      expression: null,
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
        return result;
      }
      if (ts.Node.isNoSubstitutionTemplateLiteral(expression)) {
        result.originalText = expression.getLiteralValue();
        result.twinCX = cx`${result.originalText}`;
        return result;
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
        result.originalText = literals.map((x) => x.trim()).join(' ');
        result.twinCX = cx`${result.originalText}`;
        result.expression = expression;
        return result;
      }
    }
    return result;
  };

  const parseTwinJSXNodeProp = (prop: TwinDslModels.NodeStyledProp) => {
    const parsedNodes = twinParser.runTwinParser(prop.twinCX, 0);
    return Stream.fromIterable(parsedNodes.nodes).pipe(
      Stream.mapEffect((composedClass) =>
        Effect.all({
          composedClass: Effect.succeed(composedClass),
          evaluated: twinParser.getRuleByClassName(composedClass.classNameText),
        }),
      ),
      Stream.filterMap((result) =>
        Option.map(result.evaluated, (evaluated) => ({
          evaluated,
          composedClass: result.composedClass,
        })),
      ),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
      Effect.map((parsed) => ({ parsed, prop })),
    );
  };

  return {
    parseTwinJSXNodeProp,
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
  };
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make);
