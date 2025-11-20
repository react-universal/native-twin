import { createCommonMappedAttribute, cx, mappedComponents } from '@native-twin/core';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as ts from 'typescript';
import { JSXNode, type TwinDslModels } from '../models/TwinDsl.models';

const make = Effect.gen(function* () {
  const isFunction = (node: ts.Node) =>
    Predicate.compose(ts.isFunctionExpression, ts.isArrowFunction)(node);

  const getNodeSourceFile = (node: ts.Node) => node.getSourceFile();
  const getNodeOffset = (node: ts.Node): number => node.pos;

  const findNodeAtOffset = (
    node: ts.Node,
    offset: number,
    sourceFile?: ts.SourceFile,
  ): Option.Option<ts.Node> => Option.fromNullable(node.getChildAt(offset, sourceFile));

  /**
   * Finds the deepest AST node at the specified position within the given SourceFile.
   *
   * This function traverses the AST to locate the node that contains the given position.
   * If multiple nodes overlap the position, it returns the most specific (deepest) node.
   */
  function findNodeAtPosition(sourceFile: ts.SourceFile, position: number) {
    function find(node: ts.Node): ts.Node | undefined {
      if (position >= ts.getTokenPosOfNode(node, sourceFile) && position < node.end) {
        // If the position is within this node, keep traversing its children
        return ts.forEachChild(node, find) || node;
      }
      return undefined;
    }

    return find(sourceFile);
  }

  const getFunctionReturn = (node: ts.Node) => {
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      if (ts.isBlock(node.body)) {
        for (const child of node.body.statements) {
          if (ts.isReturnStatement(child)) return child;
        }
      }
    }
  };

  const getJSXElementChilds = (node: ts.Node, sourceFile?: ts.SourceFile) =>
    pipe(
      ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) ? node : null,
      RA.liftPredicate(Predicate.isNotNullable),
      RA.flatMap((el) => (ts.isJsxElement(el) ? el.children : el.getChildren(sourceFile))),
      RA.filter((el) => ts.isJsxElement(el) || ts.isJsxSelfClosingElement(el)),
    );

  const getTwinJSXNode = (
    node: TwinDslModels.AnyJSXElement,
    sourceFile?: ts.SourceFile,
    jsxParent: JSXNode | null = null,
  ): Effect.Effect<JSXNode> =>
    Effect.gen(function* () {
      const tagName = getJSXNodeTagName(node).getText(sourceFile);
      const styledProps = getJSXMappedProps(node, sourceFile);
      const result = new JSXNode({ node, styledProps, tagName, parent: jsxParent });
      result.childs = yield* Effect.suspend(() =>
        Effect.all(
          getJSXElementChilds(node, sourceFile).map((_) => getTwinJSXNode(_, sourceFile, result)),
        ),
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

  const getNodeDebugDetails = (node: ts.Node, sourceFile?: ts.SourceFile) => {
    let name = 'Unknown';
    if (ts.isBindingName(node)) {
      name = node.getText(sourceFile);
    }
    if (isJSXElementLike(node)) {
      name = getJSXNodeTagName(node)?.getText(sourceFile) ?? node.getText(sourceFile);
    }
    if (ts.isJsxSelfClosingElement(node)) {
      name = node.tagName.getText(sourceFile);
    }
    return {
      name,
      kind: node.kind,
      kindName: `${ts.SyntaxKind[node.kind]}`,
      index: node.parent.getChildren(sourceFile).indexOf(node),
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

  const getJSXNodeTwinInfo = (node: TwinDslModels.AnyJSXElement, sourceFile?: ts.SourceFile) => {
    const tagName = getJSXNodeTagName(node);
    const childs = getJSXElementChilds(node, sourceFile);
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

  const getJSXMappedProps = (
    node: TwinDslModels.AnyJSXElement,
    sourceFile?: ts.SourceFile,
  ): TwinDslModels.NodeStyledProp[] => {
    const tagName = getJSXNodeTagName(node);
    if (!tagName) return [];
    const name = tagName.getText(sourceFile);
    const jsxConfig =
      mappedComponents.find((x) => x.name === name) ?? createCommonMappedAttribute(name);
    const props = Object.entries(jsxConfig.config);
    const attributes = getJSXElementAttributes(node).filter((x) => ts.isJsxAttribute(x)) ?? [];
    return props.flatMap(([classProp, styleProp]) =>
      attributes
        .filter((attrNode) => attrNode.name.getText(sourceFile) === classProp)
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
    findNodeAtPosition,
    isFunction,
    getNodeDebugDetails,
    getFunctionReturn,
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
  };
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make);
