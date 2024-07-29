import { SheetEntry } from '@native-twin/css';
import { ComponentTemplateEntryProp } from '../../../types/jsx.types';

export const templatePropsToSheetEntriesObject = (
  templates: ComponentTemplateEntryProp[],
) => {
  return templates.reduce(
    (prev, current) => {
      if (prev[current.target]) {
        prev[current.target]?.push(...current.entries);
      }
      if (!prev[current.target]) {
        prev[current.target] = current.entries;
      }
      return prev;
    },
    {} as Record<string, SheetEntry[]>,
  );
};
