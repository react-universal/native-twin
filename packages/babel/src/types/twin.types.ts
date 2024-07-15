import { SelectorGroup, SheetEntry } from '@native-twin/css';

export interface PartialRule extends SheetEntry {
  group: SelectorGroup;
}
