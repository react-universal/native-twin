import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { JSXElementNode } from './models/JSXElement.model';
import { getElementEntries, TwinCompilerService } from './models/compiler.model';
import { getOpeningElement } from './twin.maps';
import { createJSXAttribute, entriesToObject } from './utils/ts.utils';

const createElementStyleSheet = (
  value: HashSet.HashSet<JSXElementNode>,
): HashSet.HashSet<JSXElementNode> => {
  return pipe(
    value,
    HashSet.reduce(HashSet.empty<JSXElementNode>(), (prev, current) => {
      return pipe(
        createElementStyleSheet(current.childs),
        HashSet.add(current),
        HashSet.union(prev),
      );
    }),
  );
};
export const compileFile = Effect.gen(function* ($) {
  const compiler = yield* TwinCompilerService;
  const ctx = yield* MetroTransformerContext;

  const parents = yield* compiler.getParentNodes(compiler.ast);
  const elements = pipe(
    createElementStyleSheet(parents),
    HashSet.map((node) => {
      const sheet = node.getTwinSheet(ctx.twin);
      return visitElementNode(node, sheet);
    }),
  );

  yield* Effect.promise(() => compiler.ast.save());

  const result = {
    code: compiler.ast.getText(),
    full: compiler.ast.getFullText(),
    compilerNode: compiler.ast.compilerNode.text,
    elements,
  };

  return result;
});

function visitElementNode(
  node: JSXElementNode,
  sheet: ReturnType<typeof getElementEntries>,
) {
  const componentEntries = entriesToObject(node.id.id, sheet);

  pipe(
    getOpeningElement(node.path.node),
    Option.map((element) => {
      if (!element.getAttribute('_twinComponentID')) {
        element.addAttribute(createJSXAttribute('_twinComponentID', `"${node.id.id}"`));
      }
      if (!element.getAttribute('_twinComponentTemplateEntries')) {
        element.addAttribute(
          createJSXAttribute(
            '_twinComponentTemplateEntries',
            `${componentEntries.templateEntries}`,
          ),
        );
      }
      if (!element.getAttribute('_twinComponentSheet')) {
        element.addAttribute(
          createJSXAttribute('_twinComponentSheet', componentEntries.styledProp),
        );
      }
    }),
  );

  return { node, sheet, entries: RA.flatMap(sheet, (x) => x.entries) };
}
