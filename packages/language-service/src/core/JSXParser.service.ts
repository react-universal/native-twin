import { createCommonMappedAttribute, mappedComponents } from '@native-twin/core';
import { asArray, hasOwnProperty } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import ts from 'typescript';
import * as Spec from '../internal/LSPAdapterSpec';
import type { JSXNode, TwinDslModels } from '../models/TwinDsl.models';
import { TwinSourceFile } from '../models/TwinSourceFile';
import { TwinParserContext } from './TwinParser.service';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;
  const twinParser = yield* TwinParserContext;

  function extractJsxElements(declarations: ts.VariableDeclarationList) {
    return ts.getInitializedVariables(declarations).flatMap((declaration) => {
      const returnStatement = tsUtils.getFunctionReturn(declaration.initializer);
      if (!returnStatement || !returnStatement.expression) return [];

      if (tsUtils.isJSXElementLike(returnStatement.expression)) {
        return asArray(returnStatement.expression);
      }

      if (
        ts.isParenthesizedExpression(returnStatement.expression) &&
        tsUtils.isJSXElementLike(returnStatement.expression.expression)
      ) {
        return asArray(returnStatement.expression.expression);
      }

      return [];
    });
  }

  function getJSXRootsFromSource(sourceFile: ts.SourceFile) {
    let jsxElements: TwinDslModels.AnyJSXElement[] = [];
    for (const statement of sourceFile.statements) {
      if (ts.isSpreadAssignment(statement)) {
      }
      if (!ts.isVariableStatement(statement)) continue;
      jsxElements = jsxElements.concat(extractJsxElements(statement.declarationList));
    }
    return jsxElements;
  }

  function getJSXElementStyledProps(node: TwinDslModels.AnyJSXElement, sourceFile?: ts.SourceFile) {
    const tagName = tsUtils.getJSXNodeTagName(node).getText(sourceFile);
    const mappedConfig =
      mappedComponents.find((x) => x.name === tagName) ?? createCommonMappedAttribute(tagName);
    const styledProps: {
      name: ts.JsxAttributeName;
      value: ts.JsxAttributeValue;
      source: string;
      target: string;
      attribute: ts.JsxAttribute;
    }[] = [];
    for (const attribute of tsUtils.getJSXElementAttributes(node)) {
      if (!ts.isJsxAttribute(attribute)) continue;
      const propName = attribute.name.getText(sourceFile);
      if (!hasOwnProperty.call(mappedConfig.config, propName)) continue;
      if (!attribute.initializer) continue;

      styledProps.push({
        name: attribute.name,
        value: attribute.initializer,
        source: propName,
        target: mappedConfig.config[propName],
        attribute,
      });
    }
    return styledProps;
  }

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.statements).pipe(
      Stream.filterMap((_) => Option.fromNullable(getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), tsUtils.getTwinJSXNode(jsxElement, sourceFile)),
      ),
      Stream.map(([...args]) => makeNodeJSXDeclarator(...args)),
      Stream.runCollect,
      Effect.map((declarations) => new TwinSourceFile(sourceFile, RA.fromIterable(declarations))),
    );
  }

  const getJSXElementStatement = (node: ts.Statement) => {
    if (ts.isVariableStatement(node)) {
      const declarations = node.declarationList.declarations;
      for (const declaration of declarations) {
        const initializer = declaration.initializer;
        if (!initializer) continue;
        const returnStat = tsUtils.getFunctionReturn(initializer);
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

  function parseTwinJSXNodeProp(prop: TwinDslModels.NodeStyledProp, sourceFile?: ts.SourceFile) {
    const parsedNodes = twinParser.runTwinParser(
      prop.twinCX,
      prop.valueTextNode?.getStart(sourceFile) ?? 0,
    );
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

  const runTwinOnSourceFile = (sourceFile: ts.SourceFile) =>
    Effect.gen(function* () {
      const parsed = yield* parseSourceFile(sourceFile);

      const flattenNodes = parsed.jsxDeclarators.flatMap((x) =>
        RA.fromIterable(flatJSXDeclarator(x).values()),
      );

      return yield* Stream.fromIterable(flattenNodes).pipe(
        Stream.flatMap((jsxNode) => {
          return Stream.fromIterable(jsxNode.styledProps).pipe(
            Stream.mapEffect((prop) => parseTwinJSXNodeProp(prop, sourceFile)),
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

  const jsxNodesToRegions = (nodes: TwinDslModels.AnyJSXElement[], sourceFile?: ts.SourceFile) => {
    if (nodes.length === 0) return [];

    const regions: Spec.AnyTwinNodeRegion[] = [];
    const nodesToVisit: ts.Node[] = [...nodes];
    while (nodesToVisit.length > 0) {
      const nextNode = nodesToVisit.pop();
      if (!nextNode) break;
      if (tsUtils.isJSXElementLike(nextNode)) {
        const props = getJSXElementStyledProps(nextNode, sourceFile);
        const regionProps = props.map((prop): Spec.JsxAttributeRegion => {
          const nameRange = ts.rangeOfNode(prop.name);
          const attributeBinding = Spec.TwinLSPNode.createAttributeBinding({
            range: Spec.range(Spec.position(nameRange.pos), Spec.position(nameRange.end)),
            getText: () => prop.name.getText(sourceFile),
          });
          const valueRange = ts.rangeOfNode(prop.value);
          const attributeValue = Spec.TwinLSPNode.createJsxAttributeValue({
            range: Spec.range(Spec.position(valueRange.pos), Spec.position(valueRange.end)),
            getText: () => prop.value.getText(sourceFile),
          });

          const fullRange = ts.rangeOfNode(prop.attribute);
          return Spec.TwinLSPNode.createAttributeRegion({
            getText: () => prop.name.getText(sourceFile),
            attributeBinding,
            attributeValue,
            range: Spec.range(Spec.position(fullRange.pos), Spec.position(fullRange.end)),
          });
        });
        const nodeRange = ts.rangeOfNode(nextNode);
        const tagName = tsUtils.getJSXNodeTagName(nextNode);
        const tagNameRange = ts.rangeOfNode(tagName);
        regions.push(
          Spec.TwinLSPNode.createJsxNode({
            getText: () => nextNode.getText(sourceFile),
            range: Spec.range(Spec.position(nodeRange.pos), Spec.position(nodeRange.end)),
            styledProps: regionProps,
            tagName: Spec.TwinLSPNode.createJsxTagName({
              getText: () => tagName.getText(sourceFile),
              range: Spec.range(Spec.position(tagNameRange.pos), Spec.position(tagNameRange.end)),
            }),
          }),
        );
        nodesToVisit.push(...tsUtils.getJSXElementChilds(nextNode, sourceFile));
      }
    }

    return regions;
  };

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
