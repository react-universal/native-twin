// @ts-nocheck
import type { AnyStyle, GetChildStylesArgs, SheetInteractionState } from '@universal-labs/css';
import type { SheetEntry } from '../types/css.types';

export function createComponentSheet(entries: SheetEntry[]) {
  const sheet = getSheetEntryStyles(entries);
  return {
    getChildStyles,
    getStyles,
    sheet,
  };
  function getStyles(input: SheetInteractionState) {
    const styles: AnyStyle = { ...sheet.base };
    if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
    if (input.isParentActive) Object.assign(styles, { ...sheet.group });
    return styles;
  }

  function getChildStyles(input: GetChildStylesArgs) {
    const result: AnyStyle = {};
    if (input.isFirstChild) {
      Object.assign(result, sheet.first);
    }
    if (input.isLastChild) {
      Object.assign(result, sheet.last);
    }
    if (input.isEven) {
      Object.assign(result, sheet.even);
    }
    if (input.isOdd) {
      Object.assign(result, sheet.odd);
    }
    return Object.freeze(result);
  }
}
