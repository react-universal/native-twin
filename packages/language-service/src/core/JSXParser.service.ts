import { createCommonMappedAttribute, cx, mappedComponents } from '@native-twin/core';
import { asArray, hasOwnProperty } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import * as Spec from '../internal/LSPAdapterSpec';
import { JSXNode, type TwinDslModels } from '../models/TwinDsl.models';
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

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.getStatements()).pipe(
      Stream.filterMap((_) => Option.fromNullable(getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), getTwinJSXNode(jsxElement)),
      ),
      Stream.map(([...args]) => makeNodeJSXDeclarator(...args)),
      Stream.runCollect,
      Effect.map((declarations) => new TwinSourceFile(sourceFile, RA.fromIterable(declarations))),
    );
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
        if (ts.Node.isJsxElement(maybeJSX)) {
          return { jsxElement: maybeJSX, declarator: declaration.getNameNode() };
        }
      }
    }
  }

  function parseTwinJSXNodeProp(prop: TwinDslModels.NodeStyledProp, _document: TextDocument) {
    const parsedNodes = twinParser.runTwinParser(
      prop.twinCX,
      prop.valueTextNode?.getPos() ?? prop.node.getPos(),
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
  }

  function flattenNode(node: JSXNode, currentPath: string[]): [string, JSXNode][] {
    const nextPath = [...currentPath, `${node.index}`];
    const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
    return [[nextPath.join('-').concat(node.id), node], ...childs];
  }

  // function runTwinOnSourceFile(sourceFile: ts.SourceFile) {
  //   return Effect.gen(function* () {
  //     const parsed = yield* parseSourceFile(sourceFile);

  //     const flattenNodes = parsed.jsxDeclarators.flatMap((x) =>
  //       RA.fromIterable(flatJSXDeclarator(x).values()),
  //     );

  //     return yield* Stream.fromIterable(flattenNodes).pipe(
  //       Stream.flatMap((jsxNode) => {
  //         return Stream.fromIterable(jsxNode.styledProps).pipe(
  //           Stream.mapEffect((prop) => parseTwinJSXNodeProp(prop)),
  //           Stream.map((evaluated) => Object.assign(evaluated, { jsxNode })),
  //         );
  //       }),
  //       Stream.runCollect,
  //       Effect.map((chunks) => {
  //         return {
  //           jsxNodes: RA.fromIterable(chunks),
  //           sourceFile,
  //         };
  //       }),
  //     );
  //   });
  // }

  const getNodeRange = (document: TextDocument, node: ts.Node) =>
    Spec.range(document.positionAt(node.getPos()), document.positionAt(node.getEnd()));

  function getJSXNodeRegion(
    node: TwinDslModels.AnyJSXElement,
    document: TextDocument,
  ): Spec.JsxNodeRegion {
    const styledProps = getJSXElementStyledProps(node).map((prop) => {
      const attributeBinding = Spec.TwinLSPNode.createAttributeBinding({
        range: getNodeRange(document, prop.name),
        getText: () => prop.name.getText(),
      });
      const attrRange = getNodeRange(document, prop.value);
      // const finalText = document.getText(attrRange);
      // const initialTokens = ['"', "'", '`', '{', '}'];
      // const searchInitial = initialTokens.flatMap((x): [string, number][] => {
      //   const reg = new RegExp(x, 'g');
      //   const match = reg.exec(finalText);
      //   if (!match) return [];
      //   const count = match.length;
      //   return [[x, count] as const];
      // });
      // if (searchInitial.length > 0) {
      //   for (const [needle, count] of searchInitial) {
      //     finalText = finalText.replaceAll(new RegExp(needle, 'g'), '');
      //     attrRange.start = { ...attrRange.start, character: attrRange.start.character + count };
      //   }
      //   attrRange.start.character = attrRange.start.character + 1;
      // }

      const attrValue = getJSXAttributeValue(prop.attribute);
      // const nodeText = document.getText(attrRange);
      // const valueText = attrValue.originalText;
      // if (nodeText !== valueText) {
      //   const index = nodeText.indexOf(valueText);
      //   finalRange = {
      //     ...attrRange,
      //     start: { character: attrRange.start.character + index, line: attrRange.start.line },
      //     end: {
      //       character: attrRange.start.character + valueText.length,
      //       line: attrRange.end.line,
      //     },
      //   };
      // }
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

    while (nodesToVisit.length > 0) {
      const nextNode = nodesToVisit.pop();
      if (!nextNode) break;

      if (tsUtils.isJSXElementLike(nextNode)) {
        regions.push(getJSXNodeRegion(nextNode, document));
        nodesToVisit.push(...getJSXElementChilds(nextNode));
      }
    }

    return regions;
  }

  function filterNodeAtPosition(
    regions: Spec.AnyTwinNodeRegion[],
    position: Spec.LSPPosition,
    document: Spec.LSPTextDocument,
  ): Spec.AnyTwinNodeRegion | null {
    // const offset = document.getOffsetAt(position);

    const current = regions.pop();
    if (!current) return null;

    if (current._tag === 'JsxNodeRegion') {
      if (document.isPositionInRange(position, current.range)) {
        regions.push(...current.styledProps);
      }
    }
    if (current._tag === 'JsxAttributeRegion') {
      regions.push(...[current.attributeBinding, current.attributeValue]);
    }

    if (current._tag === 'JsxAttributeValueRegion') {
      if (document.isPositionInRange(position, current.range)) {
        return current;
      }
    }

    return filterNodeAtPosition(regions, position, document);
  }

  const getTwinJSXNode = (
    node: TwinDslModels.AnyJSXElement,
    jsxParent: JSXNode | null = null,
  ): Effect.Effect<JSXNode> =>
    Effect.gen(function* () {
      const tagName = getJSXNodeTagName(node).getText();
      const styledProps = getJSXMappedProps(node);
      const result = new JSXNode({ node, styledProps, tagName, parent: jsxParent });
      result.childs = yield* Effect.all(
        getJSXElementChilds(node).map((_) => getTwinJSXNode(_, result)),
      );

      return result;
    });

  const getJSXElementChilds = (node: ts.Node) => {
    return pipe(
      // ts.Node.isJsxElement(node) || ts.Node.isJsxSelfClosingElement(node) ? node : null,
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

  return {
    jsxNodesToRegions,
    getJSXRootsFromSource,
    getTwinJSXNode,
    getJSXElementStatement,
    parseTwinJSXNodeProp,
    parseSourceFile,
    getJSXMappedProps,
    getJSXElementChilds,
    flatJSXDeclarator,
    flattenNode,
    filterNodeAtPosition,
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
