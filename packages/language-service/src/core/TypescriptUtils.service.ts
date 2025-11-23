import { createCommonMappedAttribute, cx, mappedComponents } from '@native-twin/core';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import ts from 'ts-morph';
import * as LSP from '../internal/LSPAdapterSpec';
import { JSXNode, type TwinDslModels } from '../models/TwinDsl.models';

const make = Effect.gen(function* () {
  const isFunction = (node: ts.Node) =>
    Predicate.compose(ts.Node.isFunctionExpression, ts.Node.isArrowFunction)(node);

  const getNodeSourceFile = (node: ts.Node) => node.getSourceFile();
  const getNodeOffset = (node: ts.Node): number => node.getPos();

  const findNodeAtOffset = (node: ts.Node, offset: number): Option.Option<ts.Node> =>
    Option.fromNullable(node.getChildAtPos(offset));

  /**
   * Finds the deepest AST node at the specified position within the given SourceFile.
   *
   * This function traverses the AST to locate the node that contains the given position.
   * If multiple nodes overlap the position, it returns the most specific (deepest) node.
   */
  function findNodeAtPosition(sourceFile: ts.SourceFile, position: number) {
    function find(node: ts.Node): ts.Node | undefined {
      if (position >= node.getPos() && position < node.getEnd()) {
        // If the position is within this node, keep traversing its children
        return node.forEachChild(find) || node;
      }
      return undefined;
    }

    return find(sourceFile);
  }

  const getFunctionReturn = (node: ts.Node) => {
    if (ts.Node.isFunctionExpression(node) || ts.Node.isArrowFunction(node)) {
      const body = node.getBody();
      if (ts.Node.isBlock(body)) {
        for (const child of body.getStatements()) {
          if (ts.Node.isReturnStatement(child)) return child;
        }
      }
    }
  };

  const getJSXElementChilds = (node: ts.Node) =>
    pipe(
      ts.Node.isJsxElement(node) || ts.Node.isJsxSelfClosingElement(node) ? node : null,
      RA.liftPredicate(Predicate.isNotNullable),
      RA.flatMap((el) => (ts.Node.isJsxElement(el) ? el.getChildren() : el.getChildren())),
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
    const exports = source.getStatements().filter((x) => ts.Node.isExportDeclaration(x));
    const declarations: ts.Node[] = [
      ...source.getStatements().filter((x) => ts.Node.isVariableDeclaration(x)),
      ...source.getStatements().filter((x) => ts.Node.isFunctionDeclaration(x)),
    ];
    const functions = source.getStatements().filter((x) => ts.Node.isFunctionDeclaration(x));
    const outsideNodes = source.getReferencingSourceFiles();
    return { exports, declarations, functions, outsideNodes };
  };

  const getNodeDebugDetails = (node: ts.Node) => {
    let name = 'Unknown';
    if (ts.Node.isBindingNamed(node)) {
      name = node.getText();
    }
    if (isJSXElementLike(node)) {
      name = getJSXNodeTagName(node)?.getText() ?? node.getText();
    }
    if (ts.Node.isJsxSelfClosingElement(node)) {
      name = node.getTagNameNode().getText();
    }
    return {
      name,
      kind: node.getKind(),
      kindName: node.getKindName(),
      index: node.getChildIndex(),
    };
  };

  // const getNodeDependencies = (node: ts.Node) => {
  //   return node.getSourceFile.getLanguageService().findReferences(node);
  // };

  const getVariableNameExpression = (node: ts.Node) =>
    ts.Node.isPropertyDeclaration(node) || ts.Node.isVariableDeclaration(node)
      ? node.getInitializer()
      : ts.Node.isExpression(node)
        ? node
        : undefined;

  const getJSXNodeTwinInfo = (node: TwinDslModels.AnyJSXElement) => {
    const tagName = getJSXNodeTagName(node);
    const childs = getJSXElementChilds(node);
    // const dependencies = getNodeDependencies(node);

    return { tagName, childs };
  };

  const isJSXElementLike = (node: ts.Node) =>
    Predicate.or(ts.Node.isJsxElement, ts.Node.isJsxSelfClosingElement)(node);

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
      result.originalText = initializer.getText();
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
        result.originalText = expression.getText();
        result.twinCX = cx`${result.originalText}`;
        result.valueTextNode = expression;
        return result;
      }
      if (ts.Node.isTemplateExpression(expression)) {
        const literals = [expression.getHead().getText()];
        const expressions: ts.Expression[] = [];
        for (const span of expression.getTemplateSpans()) {
          const literal = span.getLiteral();
          if (ts.Node.isTemplateMiddle(literal)) {
            literals.push(literal.getText());
          } else {
            literals.push(literal.getText());
          }
          const expression = span.getExpression();
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

  const nodeToLSPRange = (node: ts.Node) =>
    LSP.range(
      LSP.position(node.getPos(), node.getStartLineNumber()),
      LSP.position(node.getEnd(), node.getEndLineNumber()),
    );

  return {
    jsx: {},
    nodeToLSPRange,
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
    getJSXElementAttributes,
    getJSXNodeTwinInfo,
    getJSXMappedProps,
    isJSXElementLike,
    getJSXNodeTagName,
  };
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make);
