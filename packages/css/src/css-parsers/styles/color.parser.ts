import { composed, number, parser, string } from '../../lib';

const rgbaUnit = string.literal('rgba');
const hslUnit = string.literal('hsl');

export const DeclarationColor = parser.choice([rgbaUnit, hslUnit]);

export const CssColorParser = parser
  .sequenceOf([
    DeclarationColor,
    composed.betweenParens(
      // string.everyCharUntil(')'),
      parser
        .many1(parser.choice([number.alphanumeric, string.char('.'), string.char(',')]))
        .map((x) => x.join('')),
    ),
  ])
  .map((x) => {
    return `${x[0]}(${x[1]})`;
  });
