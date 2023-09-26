import { useId, useMemo } from 'react';
import {
  AnyStyle,
  FinalSheet,
  GetChildStylesArgs,
  SheetInteractionState,
} from '@universal-labs/css';
import { parseCssValue } from '@universal-labs/css/tailwind';
import {
  SheetEntry,
  SheetEntryDeclaration,
  StyledContext,
  tw,
} from '@universal-labs/native-tailwind';
import { useStyledContext } from './useStyledContext';

export function useCssToRN(className: string) {
  const componentID = useId();
  const { context } = useStyledContext();
  const stylesheet = useMemo(() => {
    return createComponentSheet(tw(className), context);
  }, [className, context]);

  return { stylesheet, componentID };
}

export function createComponentSheet(entries: SheetEntry[], context: StyledContext) {
  const sheet = getSheetEntryStyles(entries, context);
  return {
    getChildStyles,
    getStyles,
    sheet,
    metadata: {
      isGroupParent: entries.some((x) => x.rule.n == 'group'),
      hasGroupEvents: Object.keys(sheet.group).length > 0,
      hasPointerEvents: Object.keys(sheet.pointer).length > 0,
    },
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

function getSheetEntryStyles(entries: SheetEntry[], context: StyledContext) {
  return entries.reduce(
    (prev, current) => {
      Object.assign(prev[current.group], composeDeclarations(current.declarations, context));
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

function composeDeclarations(declarations: SheetEntryDeclaration[], context: StyledContext) {
  return declarations.reduce((prev, current) => {
    let value: any = current[1];
    if (typeof value == 'string') {
      value = parseCssValue(current[0], value, {
        rem: context.units.rem,
        deviceHeight: context.deviceHeight,
        deviceWidth: context.deviceWidth,
      });
    }
    if (typeof value == 'object') {
      Object.assign(prev, value);
    } else {
      Object.assign(prev, {
        [current[0]]: value,
      });
    }

    return prev;
  }, {} as AnyStyle);
}
