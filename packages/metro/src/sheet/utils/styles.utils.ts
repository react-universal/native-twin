import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { RuntimeTW } from '@native-twin/core';
import {
  getEntriesObject,
  getEntryGroups,
  groupEntriesBySelectorGroup,
  isChildEntry,
  sortSheetEntries,
  RuntimeComponentEntry,
} from '@native-twin/css/jsx';
import { JSXMappedAttribute } from '../../compiler/twin.types';

export const createComponentSheet = (propEntries: RuntimeComponentEntry[]) => {
  const allEntries = pipe(
    propEntries,
    RA.flatMap((x) => x.entries),
    sortSheetEntries,
  );
  const childsSheet = pipe(
    allEntries,
    RA.filter((x) => isChildEntry(x)),
    groupEntriesBySelectorGroup,
  );

  const metadata = pipe(
    allEntries,
    RA.map((x) => x.selectors),
  );

  return { metadata, childsSheet };
};

export const getElementEntries = (
  props: JSXMappedAttribute[],
  twin: RuntimeTW,
): RuntimeComponentEntry[] => {
  return pipe(
    props,
    RA.map(({ value, prop, target }) => {
      const classNames = value.literal;

      const entries = pipe(twin(classNames), sortSheetEntries);
      const metadata = getEntryGroups({
        classNames: classNames,
        entries,
        expression: value.templates,
        prop,
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
