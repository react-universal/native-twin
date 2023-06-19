import type {
  CssDeclarationValueNode,
  CssTransformValueNode,
  CssValueDimensionNode,
} from '../../types';
import * as parser from '../lib';
import { cssNumberParser, parseDimensionsUnit } from './css.common';

const betweenParens = <A>(p: parser.Parser<A>) =>
  parser.char('(').chain((_) => p.chain((x) => parser.char(')').chain((_) => parser.unit(x))));

const commaSeparated = <A>(p: parser.Parser<A>) =>
  p.chain((x) =>
    parser
      .many(parser.literal(', ').chain((_) => p))
      .chain((xs) => parser.unit([x].concat(xs))),
  );

const parseDimensionsValue = parser
  .choice([parser.sequence(cssNumberParser, parseDimensionsUnit), cssNumberParser])
  .map(
    (x): CssValueDimensionNode => ({
      type: 'dimensions',
      unit: x[1] || 'none',
      value: parseFloat(x[0] ?? '0'),
    }),
  );

const parseTranslateValue = parser
  .literal('translate')
  .chain((_) => betweenParens(commaSeparated(parseDimensionsValue)))
  .map(
    (result): CssTransformValueNode => ({
      type: 'transform',
      dimension: '2d',
      x: result.at(0)!,
      y: result.at(1),
      z: result.at(2)!,
    }),
  );

export const parseRawDeclarationValue: parser.Parser<CssDeclarationValueNode> = parser.choice([
  parseDimensionsValue,
  parseTranslateValue,
]);
