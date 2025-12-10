import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import ts from 'ts-morph';
import { annotatedLayer } from '../utils/effect.utils';

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

  const isJSXElementLike = (node: ts.Node) =>
    Predicate.or(ts.Node.isJsxElement, ts.Node.isJsxSelfClosingElement)(node);

  const getNodeDebugDetails = (node: ts.Node) => {
    let name = 'Unknown';
    if (ts.Node.isBindingNamed(node)) {
      name = node.getText();
    }
    if (isJSXElementLike(node)) {
      if (ts.Node.isJsxElement(node)) {
        name = node.getOpeningElement().getTagNameNode().getText() ?? node.getText();
      } else {
        name = node.getTagNameNode().getText();
      }
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

  const getVariableNameExpression = (node: ts.Node) =>
    ts.Node.isPropertyDeclaration(node) || ts.Node.isVariableDeclaration(node)
      ? node.getInitializer()
      : ts.Node.isExpression(node)
        ? node
        : undefined;


  return {
    jsx: {},
    findNodeAtPosition,
    isFunction,
    getNodeDebugDetails,
    getFunctionReturn,
    getVariableNameExpression,

    extractSourceInfo,
    getNodeSourceFile,
    findNodeAtOffset,
    getNodeOffset,
    isJSXElementLike,
  };
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make).pipe(annotatedLayer('TypescriptUtils'));
