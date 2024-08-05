import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { RuntimeTW } from '@native-twin/core';
import {
  getGroupedEntries,
  getSheetMetadata,
  sortSheetEntries,
  RuntimeComponentEntry,
} from '@native-twin/css/jsx';
import { JSXMappedAttribute } from '../../compiler/twin.types';

export const getElementEntries = (
  props: JSXMappedAttribute[],
  twin: RuntimeTW,
): RuntimeComponentEntry[] => {
  return pipe(
    props,
    RA.map(({ value, prop, target }) => {
      const classNames = value.literal;

      const entries = pipe(twin(classNames), sortSheetEntries);
      return {
        prop,
        target,
        templateLiteral: value.templates,
        metadata: getSheetMetadata(entries),
        rawEntries: entries,
        entries: getGroupedEntries(entries),
      };
    }),
  );
};
