import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';
import { RuntimeTW } from '@native-twin/core';
import { RuntimeComponentEntry } from '../../sheet/sheet.types';
import {
  getEntriesObject,
  getEntryGroups,
  sheetEntriesOrder,
} from '../../sheet/utils/styles.utils';
import { MetroTransformerContext } from '../../transformer/transformer.service';
import type { JSXMappedAttribute, ValidJSXElementNode } from '../twin.types';
import { JSXElementNode } from './JSXElement.model';

export class TwinCompilerService extends Context.Tag('compiler/file-state')<
  TwinCompilerService,
  {
    ast: SourceFile;
    getJSXElements: Effect.Effect<ValidJSXElementNode[]>;
    getParentNodes: (from: Node) => Effect.Effect<HashSet.HashSet<JSXElementNode>>;
    // getElementEntries: (
    //   node: JSXElementNodeModel,
    // ) => Effect.Effect<RuntimeComponentEntry[]>;
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
      getJSXElements: Effect.sync(() => extractJSXElementsFromNode(ast)),
      getParentNodes: (from) => Effect.sync(() => getNodeJSXElementParents(from)),
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

export const getElementEntries = (
  props: JSXMappedAttribute[],
  twin: RuntimeTW,
): RuntimeComponentEntry[] => {
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
