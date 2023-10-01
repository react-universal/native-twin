import type { FlexStyle } from 'react-native';
import * as P from '@universal-labs/arc-parser';
import { getPropertyValueType } from '../utils.parser';

export const parseCssValue = (
  prop: string,
  value: string,
  context: {
    rem: number;
    deviceHeight: number;
    deviceWidth: number;
  },
) => {
  const type = getPropertyValueType(prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
  if (type == 'DIMENSION') {
    const data = ParseDimensionWithUnits(context).run(value);
    if (!data.isError) return data.result;
    return value;
  }
  if (type == 'FLEX') {
    const data = ParseFlexValue(context).run(value);
    if (!data.isError) return data.result;
    return value;
  }
  return value;
};

export const parseDeclarationUnit = P.choice([
  P.literal('px'),
  P.literal('%'),
  P.literal('em'),
  P.literal('rem'),
  P.literal('deg'),
  P.literal('vh'),
  P.literal('vw'),
  P.literal('rad'),
  P.literal('turn'),
  P.choice([
    P.literal('pc'),
    P.literal('cn'),
    P.literal('ex'),
    P.literal('in'),
    P.literal('pt'),
    P.literal('cm'),
    P.literal('mm'),
    P.literal('Q'),
  ]),
]);

const ParseCssDimensions = (context: {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}) => P.choice([P.whitespaceSurrounded(ParseDimensionWithUnits(context))]);

export const ParseFlexValue = (context: {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}) =>
  P.choice([
    P.sequenceOf([
      ParseCssDimensions(context),
      P.maybe(ParseCssDimensions(context)),
      P.maybe(P.choice([ParseCssDimensions(context), P.literal('auto')])),
    ]).map(
      ([flexGrow, flexShrink, flexBasis]): FlexStyle => ({
        flexGrow,
        flexShrink: flexShrink ?? flexGrow,
        flexBasis: flexBasis ?? '0%',
      }),
    ),
    P.literal('none').map((x) => ({
      flex: x as unknown as number,
    })),
  ]);

export const ParseDimensionWithUnits = (context: {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}) =>
  P.sequenceOf([P.float, P.maybe(parseDeclarationUnit)]).map((result) => {
    const value = parseFloat(result[0]);
    switch (result[1]) {
      case 'px':
        return value;
      case 'rem':
      case 'em':
        return value * context.rem;
      case '%':
        return `${value}%` as unknown as number;
      case 'vh':
        return context.deviceHeight * (value / 100);
      case 'vw':
        return context.deviceWidth * (value / 100);
      case 'turn':
        return `${360 * value}deg` as unknown as number;
      case 'deg':
        return `${value}deg` as unknown as number;
      case 'rad':
        return `${value}rad` as unknown as number;
      case 'in':
        return value * 96;
      case 'pc':
        return value * (96 / 6);
      case 'pt':
        return value * (96 / 72);
      case 'cm':
        return value * 97.8;
      case 'mm':
        return value * (97.8 / 10);
      case 'Q':
        return value * (97.8 / 40);
      default:
        return value;
    }
  });
