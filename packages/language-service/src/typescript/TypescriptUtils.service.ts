import { mappedComponents } from '@native-twin/compiler';
import { asArray } from '@native-twin/helpers';
import * as Array from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import ts from 'ts-morph';

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
    if (node.isKind(ts.SyntaxKind.JsxElement)) return { jsxElement: node };
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

  const getJSXElementStructure = (node: ts.Structure): ts.JsxElementStructure | null => {
    if (!ts.Structure.isJsxElement(node)) return null;

    return {
      kind: node.kind,
      name: node.name,
      bodyText: node.bodyText,
      attributes: asArray(node.attributes),
      children: asArray(node.children),
    };
  };

  const getJSXElementChilds = (node: ts.Node) =>
    pipe(
      node.asKind(ts.SyntaxKind.JsxElement) ?? node.asKind(ts.SyntaxKind.JsxSelfClosingElement),
      Array.liftPredicate(Predicate.isNotNullable),
      Array.flatMap((el) => (ts.Node.isJsxElement(el) ? el.getJsxChildren() : el.getChildren())),
      Array.filter((el) => ts.Node.isJsxElement(el) || ts.Node.isJsxSelfClosingElement(el)),
    );

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

  const getJSXNodeTwinInfo = (node: ts.Node) => {
    const tagName = getJSXNodeTagName(node);
    const childs = getJSXElementChilds(node);
    const dependencies = getNodeDependencies(node);

    return { tagName, childs, dependencies };
  };

  const isJSXElementLike = (node: ts.Node) =>
    Predicate.or(ts.Node.isJsxElement, ts.Node.isJsxSelfClosingElement)(node);

  const getJSXNodeTagName = (node: ts.Node) => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getTagNameNode();
    if (ts.Node.isJsxSelfClosingElement(node)) return node.getTagNameNode();
    return null;
  };

  const getJSXElementAttributes = (node: ts.Node) => {
    if (ts.Node.isJsxElement(node)) return node.getOpeningElement().getAttributes();
    if (ts.Node.isJsxSelfClosingElement(node)) return node.getAttributes();
    return [];
  };

  const getJSXMappedProps = (node: ts.Node) => {
    const tagName = getJSXNodeTagName(node);
    if (!tagName) return [];
    const name = tagName.getText();
    const jsxConfig = mappedComponents.find((x) => x.name === name);
    const props = Object.entries(jsxConfig?.config ?? {});
    const attributes = getJSXElementAttributes(node).filter((x) => ts.Node.isJsxAttribute(x));
    return props.flatMap(([prop, target]) =>
      attributes
        .filter((attr) => attr.getNameNode().getText() === prop)
        .map((attr) => ({ prop, target, value: attr })),
    );
  };

  return yield* Effect.succeed({
    isFunction,
    getNodeDependencies,
    getNodeDebugDetails,
    getJSXElementStatement,
    getVariableNameExpression,
    getJSXElementChilds,
    getJSXElementStructure,
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
