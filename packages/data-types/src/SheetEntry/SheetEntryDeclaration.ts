import type * as Styles from '../Styles';

export interface SheetEntryDeclaration {
  prop: string;
  value: number | string | Styles.AnyStyle | SheetEntryDeclaration[];
};
