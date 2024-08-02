import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { Identifier, Node, SourceFile, SyntaxKind } from 'ts-morph';
import { RuntimeTW } from '@native-twin/core';
import { RuntimeComponentEntry } from '../../sheet/sheet.types';
import {
  getEntriesObject,
  getEntryGroups,
  sheetEntriesOrder,
} from '../../sheet/utils/styles.utils';
import { MetroTransformerContext } from '../../transformer/transformer.service';
import type { MappedComponent } from '../../utils';
import { getOpeningElement } from '../twin.maps';
import type {
  JSXMappedAttribute,
  ValidJSXElementNode,
  ValidOpeningElementNode,
} from '../twin.types';
import {
  getComponentID,
  getComponentStyledEntries,
  getIdentifierText,
  getJSXElementConfig,
  getJSXElementTagName,
} from '../utils/ts.utils';
import { JSXElementNode } from './JSXElement.model';

export class TwinCompilerService extends Context.Tag('compiler/file-state')<
  TwinCompilerService,
  {
    ast: SourceFile;
    getJSXElements: Effect.Effect<ValidJSXElementNode[]>;
    mapJSXElementNodeToModel: (
      node: ValidJSXElementNode,
    ) => Option.Option<JSXElementNodeModel>;
    getJSXNodeChilds: (node: JSXElementNodeModel) => Effect.Effect<JSXElementNodeModel[]>;
    getParentNodes: (from: Node) => Effect.Effect<HashSet.HashSet<JSXElementNode>>;
    getElementEntries: (
      node: JSXElementNodeModel,
    ) => Effect.Effect<RuntimeComponentEntry[]>;
  }
>() {}

export const TwinCompilerServiceLive = Layer.scoped(
  TwinCompilerService,
  Effect.gen(function* () {
    const ctx = yield* MetroTransformerContext;
    const code = Buffer.from(ctx.sourceCode).toString('utf-8');
    const ast = ctx.tsCompiler.createSourceFile(ctx.filename, code, {
      overwrite: true,
    });
    return {
      ast,
      mapJSXElementNodeToModel: jsxElementToModel,
      getJSXElements: Effect.sync(() => extractJSXElementsFromNode(ast)),
      getParentNodes: (from) => Effect.sync(() => getNodeJSXElementParents(from)),
      getElementEntries: (node) =>
        Effect.sync(() => getElementEntries(node.mappedProps, ctx.twin)),
      getJSXNodeChilds: (path: JSXElementNodeModel) =>
        Effect.sync(() => getElementChilds(path)),
    };
  }),
);

const getNodeJSXElementParents = (path: Node) => {
  const parentsMap = new Set<JSXElementNode>();
  path.forEachDescendant((descendant, traversal) => {
    if (!Node.isJsxElement(descendant)) return undefined;
    const node = new JSXElementNode(descendant);

    parentsMap.add(node);

    traversal.skip();
  });
  return pipe(parentsMap, HashSet.fromIterable);
};

const getElementChilds = (path: JSXElementNodeModel) => {
  return pipe(
    extractJSXElementsFromNode(path.node),
    RA.map((x) => jsxElementToModel(x)),
    RA.getSomes,
    RA.map((x, i) => {
      return { ...x, order: i };
    }),
  );
};

export const getElementEntries = (props: JSXMappedAttribute[], twin: RuntimeTW) => {
  return pipe(
    props,
    RA.map(({ value, prop, target }) => {
      const classNames = value.literal;

      const entries = pipe(twin(classNames), RA.sort(sheetEntriesOrder));
      const metadata = getEntryGroups({
        classNames: classNames,
        entries,
        expression: value.templates,
        prop: prop,
        target: target,
      });
      return {
        prop,
        target,
        templateLiteral: value.templates,
        metadata,
        entries,
        groupedEntries: getEntriesObject([...entries]),
      };
    }),
  );
};

const extractJSXElementsFromNode = (path: Node): ValidJSXElementNode[] => {
  return pipe(
    path.getDescendantsOfKind(SyntaxKind.JsxElement),
    RA.appendAll(path.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)),
  );
};

export interface JSXElementNodeModel {
  id: string;
  node: ValidJSXElementNode;
  tagName: Identifier;
  styledConfig: MappedComponent | null;
  mappedProps: JSXMappedAttribute[];
  openingElement: ValidOpeningElementNode;
  order: number;
}

export const jsxElementToModel = (
  node: ValidJSXElementNode,
  order = 0,
): Option.Option<JSXElementNodeModel> => {
  return Option.gen(function* () {
    const tagName = yield* Option.fromNullable(getJSXElementTagName(node));
    const openingElement = yield* getOpeningElement(node);

    const styledConfig = getJSXElementConfig(tagName);
    const mappedProps = styledConfig
      ? getComponentStyledEntries(openingElement, styledConfig)
      : [];

    const id = getComponentID(
      node,
      node.getSourceFile().getFilePath(),
      getIdentifierText(tagName),
    );

    return {
      node,
      id,
      tagName,
      styledConfig,
      openingElement,
      mappedProps,
      order,
    };
  });
};
