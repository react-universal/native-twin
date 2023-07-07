import { choice } from '../common/choice.parser';
import {
  betweenParens,
  parseDeclarationUnit,
  parseMathOperatorSymbol,
  whitespaceSurrounded,
} from '../common/composed.parsers';
import { maybe } from '../common/maybe.parser';
import { float } from '../common/number.parser';
import { recursiveParser } from '../common/recursive.parser';
import { sequenceOf } from '../common/sequence-of';
import { literal } from '../common/string.parser';

export const ParseCssDimensions = recursiveParser(() =>
  choice([whitespaceSurrounded(ParseDimensionWithUnits), ParseCssCalc]),
);

const ParseDimensionWithUnits = sequenceOf([float, maybe(parseDeclarationUnit)]).mapFromData(
  (parserState) => {
    const { result, data } = parserState;
    const value = parseFloat(result[0]);
    switch (result[1]) {
      case 'px':
        return value;
      case 'rem':
      case 'em':
        return value * data.context.rem;
      case '%':
        return `${value}%` as unknown as number;
      case 'vh':
        return data.context.deviceHeight! * (value / 100);
      case 'vw':
        return data.context.deviceWidth! * (value / 100);
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
  },
);

export const ParseCssMath = sequenceOf([
  ParseCssDimensions,
  parseMathOperatorSymbol,
  ParseCssDimensions,
]).map(([left, operator, right]) => {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      return left;
  }
});

const ParseCssCalc = sequenceOf([
  literal('calc'),
  betweenParens(
    sequenceOf([
      ParseDimensionWithUnits,
      whitespaceSurrounded(parseMathOperatorSymbol),
      ParseDimensionWithUnits,
    ]),
  ),
])
  .map((x) => x[1])
  .mapFromData((x) => {
    const left = x.result[0];
    const right = x.result[2];
    switch (x.result[1]) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      default:
        return left;
    }
  });
