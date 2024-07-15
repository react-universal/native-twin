import { getRuleSelectorGroup, SheetEntry } from '@native-twin/css';
import { getSheetEntryStyles } from '@native-twin/jsx';
import type { StyledContext } from '@native-twin/jsx/build/store/observables';
import { PartialRule } from '../types/twin.types';

export const sheetEntriesToPartialStyle = (entries: SheetEntry[]): PartialRule[] => {
  return entries.map((x) => ({
    ...x,
    group: getRuleSelectorGroup(x.selectors),
  }));
};

export const entriesToStyles = (entries: SheetEntry[]) => {
  return (context: StyledContext) => {
    return getSheetEntryStyles(entries, context);
  };
};
