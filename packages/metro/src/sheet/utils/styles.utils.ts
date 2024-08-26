import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { RuntimeTW } from '@native-twin/core';
import {
  getGroupedEntries,
  sortSheetEntries,
  RuntimeComponentEntry,
  compileSheetEntry,
  CompilerContext,
} from '@native-twin/css/jsx';
import { JSXMappedAttribute } from '../../compiler/ast.types';
import { JSXElementNode } from '../../compiler/models/JSXElement.model';

export const getElementEntries = (
  props: JSXMappedAttribute[],
  twin: RuntimeTW,
  ctx: CompilerContext,
): RuntimeComponentEntry[] => {
  return pipe(
    props,
    RA.map(({ value, prop, target }): RuntimeComponentEntry => {
      const classNames = value.literal;

      const entries = twin(classNames);
      const runtimeEntries = pipe(
        entries,
        RA.dedupeWith((a, b) => a.className === b.className),

        RA.map((x) => compileSheetEntry(x, ctx)),
        sortSheetEntries,
      );

      // const precompiled = pipe(runtimeEntries, runtimeEntriesToFinalSheet);
      // const unresolvedEntries = pipe(
      //   runtimeEntries,
      //   RA.filter((x) => {
      //     if (x.className === 'group') return true;
      //     return x.declarations.length > 0;
      //   }),
      // );

      return {
        prop,
        target,
        templateLiteral: value.templates,
        entries: runtimeEntries,
        // childEntries: pipe(
        //   runtimeEntries,
        //   RA.filter((x) => isChildEntry(x)),
        //   // RA.map((entry) => ({
        //   //   ...entry,
        //   //   selectors: entry.selectors.filter((x) => !isChildSelector(x)),
        //   // })),
        // ),
        rawSheet: getGroupedEntries(runtimeEntries),
        // precompiled,
      };
    }),
  );
};

/**
 * @domain Shared Transform
 * @description Extract entries from {@link JSXElementNode}
 */
export const extractEntriesFromNode = (node: JSXElementNode, twin: RuntimeTW) =>
  pipe(
    node.runtimeData,
    RA.map((x) => {
      const entries = twin(x.value.literal);
      return {
        ...x,
        entries,
      };
    }),
  );
