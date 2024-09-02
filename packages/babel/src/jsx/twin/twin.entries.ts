import generate from '@babel/generator';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { RuntimeTW } from '@native-twin/core';
import {
  CompilerContext,
  compileSheetEntry,
  getGroupedEntries,
  RuntimeComponentEntry,
  sortSheetEntries,
} from '@native-twin/css/jsx';
import { templateLiteralToStringLike } from '../../babel';
import { JSXMappedAttribute } from '../jsx.types';

export const getElementEntries = (
  props: JSXMappedAttribute[],
  twin: RuntimeTW,
  ctx: CompilerContext,
): RuntimeComponentEntry[] => {
  return pipe(
    props,
    RA.map(({ value, prop, target }): RuntimeComponentEntry => {
      let classNames = '';
      let templateExpression: null | string = null;
      if (t.isStringLiteral(value)) {
        classNames = value.value;
      } else {
        const cooked = templateLiteralToStringLike(value);
        classNames = cooked.strings;
        templateExpression = generate(cooked.expressions).code;
      }

      const entries = twin(classNames);
      const runtimeEntries = pipe(
        entries,
        RA.dedupeWith((a, b) => a.className === b.className),

        RA.map((x) => compileSheetEntry(x, ctx)),
        sortSheetEntries,
      );

      return {
        classNames,
        prop,
        target,
        templateLiteral: templateExpression,
        entries: runtimeEntries,
        // childEntries: pipe(
        //   runtimeEntries,
        //   RA.filter((x) => isChildEntry(x)),
        // ),
        rawSheet: getGroupedEntries(runtimeEntries),
      };
    }),
  );
};
