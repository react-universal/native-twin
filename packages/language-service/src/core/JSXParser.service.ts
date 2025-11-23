import { createCommonMappedAttribute, mappedComponents } from '@native-twin/core';
import { asArray, hasOwnProperty } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';
import * as Spec from '../internal/LSPAdapterSpec';
import type { JSXNode, TwinDslModels } from '../models/TwinDsl.models';
import { TwinSourceFile } from '../models/TwinSourceFile';
import { TwinParserContext } from './TwinParser.service';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;
  const twinParser = yield* TwinParserContext;

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
    const tagName = tsUtils.getJSXNodeTagName(node).getText();
    const mappedConfig =
      mappedComponents.find((x) => x.name === tagName) ?? createCommonMappedAttribute(tagName);
    const styledProps: {
      name: ts.JsxAttributeName;
      value: NonNullable<ReturnType<ts.JsxAttribute['getInitializer']>>;
      source: string;
      target: string;
      attribute: ts.JsxAttribute;
    }[] = [];
    for (const attribute of tsUtils.getJSXElementAttributes(node)) {
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

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.getStatements()).pipe(
      Stream.filterMap((_) => Option.fromNullable(getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), tsUtils.getTwinJSXNode(jsxElement)),
      ),
      Stream.map(([...args]) => makeNodeJSXDeclarator(...args)),
      Stream.runCollect,
      Effect.map((declarations) => new TwinSourceFile(sourceFile, RA.fromIterable(declarations))),
    );
  }

  function getJSXElementStatement(node: ts.Statement) {
    if (ts.Node.isVariableStatement(node)) {
      const declarations = node.getDeclarationList().getDeclarations();
      for (const declaration of declarations) {
        const initializer = declaration.getInitializer();
        if (!initializer) continue;
        const returnStat = tsUtils.getFunctionReturn(initializer);
        if (!returnStat) continue;
        const expression = returnStat.getExpression();
        if (expression && ts.Node.isParenthesizedExpression(expression)) {
          const maybeJSX = expression.getExpression();
          if (ts.Node.isJsxElement(maybeJSX)) {
            return { jsxElement: maybeJSX, declarator: declaration.getNameNode() };
          }
        }
      }
    }
    return null;
  }

  function parseTwinJSXNodeProp(prop: TwinDslModels.NodeStyledProp) {
    const parsedNodes = twinParser.runTwinParser(prop.twinCX, prop.valueTextNode?.getStart() ?? 0);
    return Stream.fromIterable(parsedNodes.composedClasses).pipe(
      Stream.mapEffect((composedClass) =>
        Effect.all({
          composedClass: Effect.succeed(composedClass),
          evaluated: twinParser.getRuleByClassName(composedClass.classNameText),
        }),
      ),
      Stream.map((result) =>
        Option.map(result.evaluated, (evaluated) => ({
          evaluated,
          composedClass: result.composedClass,
        })).pipe(Option.getOrElse(() => ({ composedClass: result.composedClass }))),
      ),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
      Effect.map((parsed) => ({ parsed, prop })),
    );
  }

  function flatJSXDeclarator(declarator: TwinDslModels.NodeJSXDeclarator) {
    const rootPath = `${declarator.filename}-${declarator.identifier}`;
    const mapped = new Map(flattenNode(declarator.jsxElement, [rootPath]));
    return mapped;

    function flattenNode(node: JSXNode, currentPath: string[]): [string, JSXNode][] {
      const nextPath = [...currentPath, `${node.index}`];
      const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
      return [[nextPath.join('-').concat(node.id), node], ...childs];
    }
  }

  function runTwinOnSourceFile(sourceFile: ts.SourceFile) {
    return Effect.gen(function* () {
      const parsed = yield* parseSourceFile(sourceFile);

      const flattenNodes = parsed.jsxDeclarators.flatMap((x) =>
        RA.fromIterable(flatJSXDeclarator(x).values()),
      );

      return yield* Stream.fromIterable(flattenNodes).pipe(
        Stream.flatMap((jsxNode) => {
          return Stream.fromIterable(jsxNode.styledProps).pipe(
            Stream.mapEffect((prop) => parseTwinJSXNodeProp(prop)),
            Stream.map((evaluated) => Object.assign(evaluated, { jsxNode })),
          );
        }),
        Stream.runCollect,
        Effect.map((chunks) => {
          return {
            jsxNodes: RA.fromIterable(chunks),
            sourceFile,
          };
        }),
      );
    });
  }

  function jsxNodesToRegions(nodes: TwinDslModels.AnyJSXElement[]) {
    if (nodes.length === 0) return [];

    const regions: Spec.AnyTwinNodeRegion[] = [];
    const nodesToVisit: ts.Node[] = [...nodes];

    while (nodesToVisit.length > 0) {
      const nextNode = nodesToVisit.pop();
      if (!nextNode) break;

      if (tsUtils.isJSXElementLike(nextNode)) {
        const props = getJSXElementStyledProps(nextNode);
        const regionProps = props.map((prop): Spec.JsxAttributeRegion => {
          const attributeBinding = Spec.TwinLSPNode.createAttributeBinding({
            range: tsUtils.nodeToLSPRange(prop.name),
            getText: () => prop.name.getText(),
          });
          const attributeValue = Spec.TwinLSPNode.createJsxAttributeValue({
            range: tsUtils.nodeToLSPRange(prop.value),
            getText: () => prop.value.getText(),
          });
          return Spec.TwinLSPNode.createAttributeRegion({
            getText: () => prop.name.getText(),
            attributeBinding,
            attributeValue,
            range: tsUtils.nodeToLSPRange(prop.attribute),
          });
        });
        const nodeRange = tsUtils.nodeToLSPRange(nextNode);
        const tagName = tsUtils.getJSXNodeTagName(nextNode);
        const tagNameRange = tsUtils.nodeToLSPRange(tagName);
        regions.push(
          Spec.TwinLSPNode.createJsxNode({
            getText: () => nextNode.getText(),
            range: nodeRange,
            styledProps: regionProps,
            tagName: Spec.TwinLSPNode.createJsxTagName({
              getText: () => tagName.getText(),
              range: tagNameRange,
            }),
          }),
        );
        nodesToVisit.push(...tsUtils.getJSXElementChilds(nextNode));
      }
    }

    return regions;
  }

  return {
    jsxNodesToRegions,
    getJSXRootsFromSource,
    parseSourceFile,
    getJSXElementStyledProps,
    flatJSXDeclarator,
    parseTwinJSXNodeProp,
    runTwinOnSourceFile,
    getJSXElementStatement,
  };
});

const makeNodeJSXDeclarator = (
  declarator: ts.BindingName,
  jsxElement: JSXNode,
): TwinDslModels.NodeJSXDeclarator => ({
  _tag: 'NodeJSXDeclarator',
  binding: declarator,
  filename: jsxElement.filename,
  identifier: declarator.getText(),
  jsxElement,
  node: declarator,
});

export interface JSXParser extends Effect.Effect.Success<typeof make> {}
export const JSXParser = Context.GenericTag<JSXParser>('JSXParser');
export const JSXParserLive = Layer.effect(JSXParser, make);
