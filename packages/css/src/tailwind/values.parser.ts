import type { FlexStyle } from 'react-native';
import { choice } from '../parsers/choice.parser';
import { whitespaceSurrounded } from '../parsers/composed.parsers';
import { maybe } from '../parsers/maybe.parser';
import { float } from '../parsers/number.parser';
import { sequenceOf } from '../parsers/sequence-of';
import { literal } from '../parsers/string.parser';
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
  const type = getPropertyValueType(prop);
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

export const parseDeclarationUnit = choice([
  literal('px'),
  literal('%'),
  literal('em'),
  literal('rem'),
  literal('deg'),
  literal('vh'),
  literal('vw'),
  literal('rad'),
  literal('turn'),
  choice([
    literal('pc'),
    literal('cn'),
    literal('ex'),
    literal('in'),
    literal('pt'),
    literal('cm'),
    literal('mm'),
    literal('Q'),
  ]),
]);

const ParseCssDimensions = (context: {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}) => choice([whitespaceSurrounded(ParseDimensionWithUnits(context))]);

export const ParseFlexValue = (context: {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}) =>
  choice([
    sequenceOf([
      ParseCssDimensions(context),
      maybe(ParseCssDimensions(context)),
      maybe(choice([ParseCssDimensions(context), literal('auto')])),
    ]).map(
      ([flexGrow, flexShrink, flexBasis]): FlexStyle => ({
        flexGrow,
        flexShrink: flexShrink ?? flexGrow,
        flexBasis: flexBasis ?? '0%',
      }),
    ),
    literal('none').map((x) => ({
      flex: x as unknown as number,
    })),
  ]);

export const ParseDimensionWithUnits = (context: {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}) =>
  sequenceOf([float, maybe(parseDeclarationUnit)]).map((result) => {
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
