import { CodeGenerator } from '@babel/generator';
import * as _babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import {
  createCommonMappedAttribute,
  type MappedComponent,
  mappedComponents,
} from '@native-twin/core';
import { makeTreeFrom } from '@native-twin/helpers/tree';
import * as Array from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { Regions } from '../../models/LSP.models';
import { annotatedLayer } from '../../utils/effect.utils';
import type { BabelTypes } from './Babel.types';

const make = Effect.gen(function* () {
  const getClassNamePropsFromJSX = (
    jsxElement: BabelTypes.JSXElementBabelPath,
    mappedConfig: MappedComponent,
  ) => {
    const validClassNames = Object.entries(mappedConfig.config);
    return jsxElement
      .get('openingElement')
      .get('attributes')
      .filter((x) => x.isJSXAttribute())
      .filter((prop) => {
        const namePath = prop.get('name');

        return (
          !namePath.isJSXIdentifier() ||
          typeof validClassNames.find((x) => prop.node.name.name === x[0]) !== 'undefined'
        );
      });
  };

  const getRootJSXElements = (ast: BabelTypes.BabelFileAst) =>
    Stream.async<BabelTypes.JSXElementBabelPath>((emit) => {
      traverse(
        ast,
        {
          Program: {
            exit() {
              emit.chunk(Chunk.fromIterable(this.elements)).then(() => emit.end());
            },
          },
          JSXElement(path) {
            this.elements.push(path);
            path.skip();
          },
        },
        undefined,
        {
          elements: [] as BabelTypes.JSXElementBabelPath[],
        },
      );
    });

  const getAllJSXElements = (ast: BabelTypes.BabelFileAst) =>
    getRootJSXElements(ast).pipe(
      Stream.map((babelPath) => {
        const tree = makeTreeFrom({
          input: babelPath,
          getChilds: (item) => getJSXElementChilds(item),
          transform: (jsxElement) => jsxElement,
        });
        return tree;
      }),
      Stream.map((x) => x.all()),
      Stream.flattenIterables,
      Stream.filterMap((treeNode) => {
        if (!treeNode.value.node.loc) return Option.none();

        const openingElement = treeNode.value.get('openingElement');
        const jsxElementName = openingElement.get('name');
        if (!jsxElementName.isJSXIdentifier()) return Option.none();
        const mappedComponent =
          mappedComponents.find((mapped) => mapped.name === jsxElementName.node.name) ||
          createCommonMappedAttribute(jsxElementName.node.name);

        const styledProps = getClassNamePropsFromJSX(treeNode.value, mappedComponent);
        return Option.some({
          path: treeNode.value,
          treeNode: treeNode,
          parent: treeNode.parent,
          styledProps,
          id: treeNode.value.scope.generateUidIdentifier().name,
          position: {
            startOffset: treeNode.value.node.loc.start.index,
            startLine: treeNode.value.node.loc.start.line,
            endOffset: treeNode.value.node.loc.end.index,
            endLine: treeNode.value.node.loc.end.line,
          },
        });
      }),
      Stream.runCollect,
      Effect.map(Array.fromIterable),
    );

  const getNodePosition = (node: t.Node) => {
    return Option.fromNullable(node.loc).pipe(
      Option.map((loc) => ({
        startOffset: loc.start.index,
        startLine: loc.start.line,
        endOffset: loc.end.index,
        endLine: loc.end.line,
      })),
    );
  };

  const getJSXElementChilds = (
    jsxElement: BabelTypes.JSXElementPath,
  ): BabelTypes.JSXElementPath[] => {
    const childAttrs = pathJSXAttributeChilds(jsxElement.get('openingElement'));
    return jsxElement
      .get('children')
      .filter((x) => x.isJSXElement())
      .concat(childAttrs);
  };

  const pathJSXAttributeChilds = (openingElement: BabelTypes.JSXOpeningElementPath) => {
    const jsxAttrs: BabelTypes.JSXElementPath[] = [];
    for (const attr of openingElement.get('attributes')) {
      attr.traverse({
        JSXElement: (path) => {
          jsxAttrs.push(path);
          path.skip();
        },
      });
    }
    return jsxAttrs;
  };

  function babelParse(code: string | Buffer, fileName?: string): BabelTypes.BabelFileAst {
    const codeString = code.toString();
    try {
      return parser(codeString, babelParserOptions);
    } catch (err) {
      throw new Error(
        `Error parsing babel: ${err} in ${fileName}, code:\n${codeString}\n ${(err as any).stack}`,
      );
    }
  }

  const parser = _babelParser.parse.bind(_babelParser);

  const plugins: _babelParser.ParserPlugin[] = [
    'asyncGenerators',
    'classProperties',
    'dynamicImport',
    'functionBind',
    'jsx',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'decorators-legacy',
    'typescript',
    'optionalChaining',
    'nullishCoalescingOperator',
  ];

  const babelParserOptions: _babelParser.ParserOptions = {
    plugins,
    sourceType: 'module',
    errorRecovery: true,
  };

  const templateLiteralToStringLike = (literal: t.TemplateLiteral) => {
    const strings = literal.quasis
      .map((x) => (x.value.cooked ? x.value.cooked : x.value.raw))
      .map((x) => x.trim().replace(/\n/g, '').trim().replace(/\s+/g, ' '))
      .filter((x) => x.length > 0)
      .join('');
    const expressions = t.templateLiteral(
      literal.quasis.map((x) => t.templateElement(x.value, x.tail)),
      literal.expressions,
    );
    return { strings, expressions: expressions };
  };

  return {
    babelParse,
    getClassNamePropsFromJSX,
    getAllJSXElements,
    templateLiteralToStringLike,
    getNodePosition,
    jsxNodeAttrToRegion,
    regionFromJSXElementPath,
  };

  function regionFromJSXElementPath(
    jsxElement: Effect.Effect.Success<ReturnType<typeof getAllJSXElements>>[number],
    parent: Regions.JSXNode | null,
  ): Regions.JSXNode {
    const attributes = jsxElement.styledProps
      .map((x) => jsxNodeAttrToRegion(x))
      .filter((x) => x !== null);
    let tagName = '';
    if (jsxElement.path.node.openingElement.name.type === 'JSXIdentifier') {
      tagName = jsxElement.path.node.openingElement.name.name;
    }

    return Regions.JSXNode.make(
      Object.assign(
        {
          id: jsxElement.id,
          attributes,
          text: tagName,
          rawText: tagName,
          parent,
          tag: Regions.JSXTagName.make(Object.assign({ rawText: tagName }, jsxElement.position)),
        },
        jsxElement.position,
      ),
    );
  }

  function jsxNodeAttrToRegion(node: BabelTypes.JSXElementAttributePath) {
    const nameNode = node.get('name');
    const valueNode = node.get('value');
    if (!valueNode || !valueNode.node) return null;

    const attrLocation = getNodePosition(node.node).pipe(Option.getOrThrow);
    const nameLocation = getNodePosition(nameNode.node).pipe(Option.getOrThrow);
    let valueLocation = getNodePosition(valueNode.node).pipe(Option.getOrThrow);
    let rawText = '';
    let text = '';
    if (valueNode.isStringLiteral()) {
      rawText = new CodeGenerator(valueNode.node).generate().code;
      text = valueNode.node.value;
    }
    if (valueNode.isJSXExpressionContainer()) {
      const expression = valueNode.get('expression');
      if (expression.isTemplateLiteral()) {
        const { strings } = templateLiteralToStringLike(expression.node);
        text = strings;
        rawText = new CodeGenerator(expression.node).generate().code;
        valueLocation = getNodePosition(valueNode.node.expression).pipe(Option.getOrThrow);
      }
    }
    const attributeName =
      nameNode.node.type === 'JSXIdentifier' ? nameNode.node.name : nameNode.node.name.name;
    return Regions.JSXAttribute.make({
      ...attrLocation,
      name: Regions.JSXAttributeName.make({
        ...nameLocation,
        rawText: attributeName,
        text: attributeName,
      }),
      rawText: '',
      value: Regions.JSXAttributeValue.make({
        ...valueLocation,
        rawText,
        text,
      }),
    });
  }
});

export interface BabelUtils extends Effect.Effect.Success<typeof make> {}
export const BabelUtils = Context.GenericTag<BabelUtils>('BabelUtils');

export const BabelUtilsLive = Layer.effect(BabelUtils, make).pipe(annotatedLayer('BabelUtils'));
