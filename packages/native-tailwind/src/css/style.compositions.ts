import type {
  AnyStyle,
  FinalSheet,
  GetChildStylesArgs,
  SheetInteractionState,
} from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';
import type { RuleResult } from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import { getRuleSelectorGroup } from '../utils/css-utils';
import { toClassName } from '../utils/string-utils';

export function getStyleData(rule: ParsedRule, styles: RuleResult): SheetEntry {
  const className = toClassName(rule);
  let group = getRuleSelectorGroup(rule);
  if (!styles) return [className, group, {}];
  return [className, group, styles];
}

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

function getSheetEntryStyles(entries: SheetEntry[]) {
  return entries.reduce(
    (prev, current) => {
      Object.assign(prev[current[1]], current[2]);
      return prev;
    },
    {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
    } as FinalSheet,
  );
}
