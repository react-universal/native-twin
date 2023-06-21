import type {
  CssTransformValueNode,
  CssValueDimensionNode,
  CssValueRawNode,
} from '../../types';
import * as parser from '../lib';

const emUnitToken = parser.token(parser.literal('em'));
const remUnitToken = parser.token(parser.literal('rem'));
const pxUnitToken = parser.token(parser.literal('px'));
const percentageUnitToken = parser.token(parser.literal('%'));
const cnUnitToken = parser.token(parser.literal('cn'));
const vhUnitToken = parser.token(parser.literal('vh'));
const vwUnitToken = parser.token(parser.literal('vw'));
const degUnitToken = parser.token(parser.literal('deg'));
const exUnitToken = parser.token(parser.literal('ex'));
const inUnitToken = parser.token(parser.literal('in'));

export const cssNumberParser = parser.token(
  parser
    .many(parser.choice([parser.digit, parser.char('-'), parser.char('.')]))
    .map((x) => x.join('')),
);

export const parseDimensionsUnit = parser.choice([
  emUnitToken,
  remUnitToken,
  pxUnitToken,
  percentageUnitToken,
  cnUnitToken,
  vhUnitToken,
  vwUnitToken,
  degUnitToken,
  exUnitToken,
  inUnitToken,
]);

export const parseDimensionsValue: parser.Parser<CssValueDimensionNode> = parser.token(
  parser.sequence(cssNumberParser, parseDimensionsUnit).map((x): CssValueDimensionNode => {
    return {
      type: 'dimensions',
      unit: x[1],
      value: parseFloat(x[0]),
    };
  }),
);

export const parseBetweenParens = <A>(p: parser.Parser<A>) =>
  parser.char('(').chain((_) => p.chain((x) => parser.char(')').chain((_) => parser.unit(x))));

export const parseBetweenBrackets = <A>(p: parser.Parser<A>) =>
  parser.char('{').chain((_) => p.chain((x) => parser.char('}').chain((_) => parser.unit(x))));

export const parseCommaSeparated = <A>(p: parser.Parser<A>) =>
  p.chain((x) =>
    parser
      .many(parser.literal(', ').chain((_) => p))
      .chain((xs) => parser.unit([x].concat(xs))),
  );

/**
 * separated by space
 */
export const parseSpaceSeparated = <A>(p: parser.Parser<A>) =>
  p.chain((x) =>
    parser.many(parser.char(' ').chain((_) => p)).chain((y) => parser.unit([x].concat(y))),
  );
/**
 * separated by ":"
 */
export const parseColonSeparated = <A>(p: parser.Parser<A>) =>
  p.chain((x) =>
    parser
      .many(parser.literal(':').chain((_) => p))
      .chain((xs) => parser.unit([x].concat(xs))),
  );

/**
 * separated by ";"
 */
export const parseSemiColonSeparated = <A>(p: parser.Parser<A>) =>
  p.chain((x) =>
    parser
      .many(parser.literal(';').chain((_) => p))
      .chain((xs) => parser.unit([x].concat(xs))),
  );
export const parseTranslateValue = parser
  .literal('translate')
  .chain((_) =>
    parseBetweenParens(
      parseCommaSeparated(
        parser.choice([
          parseDimensionsValue,
          cssNumberParser.map(
            (x): CssValueDimensionNode => ({
              type: 'dimensions',
              unit: 'none',
              value: parseFloat(x),
            }),
          ),
        ]),
      ),
    ),
  )
  .map(
    (result): CssTransformValueNode => ({
      type: 'transform',
      dimension: '2d',
      x: result[0]!,
      y: result[1],
      z: result[2],
    }),
  );

const plusToken: parser.Parser<'+'> = parser.token(
  parser.satisfies((x) => x === '+').chain((_) => parser.unit('+')),
);
const minusToken: parser.Parser<'-'> = parser.token(
  parser.satisfies((x) => x === '-').chain((_) => parser.unit('-')),
);
const multiplyToken: parser.Parser<'*'> = parser.token(
  parser.satisfies((x) => x === '*').chain((_) => parser.unit('*')),
);
const divideToken: parser.Parser<'/'> = parser.token(
  parser.satisfies((x) => x === '/').chain((_) => parser.unit('/')),
);

const parseOperationSymbols: parser.Parser<'+' | '-' | '*' | '/'> = parser.choice([
  plusToken,
  minusToken,
  multiplyToken,
  divideToken,
]);

const concatDimensions = parseDimensionsValue.chain((x) =>
  parseOperationSymbols.chain((op) =>
    cssNumberParser.chain((y) => {
      switch (op) {
        case '*':
          return parser.unit({ ...x, value: x.value * parseFloat(y) });
        case '+':
          return parser.unit({ ...x, value: x.value + parseFloat(y) });
        case '-':
          return parser.unit({ ...x, value: x.value - parseFloat(y) });
        case '/':
          return parser.unit({ ...x, value: x.value / parseFloat(y) });
      }
    }),
  ),
);

export const parseCalcValue = parser
  .literal('calc')
  .chain((_) => parseBetweenParens(concatDimensions));

export const parseRawValue: parser.Parser<CssValueRawNode> = parser.makeParser((cs) => {
  const colonIndex = cs.indexOf(';');
  if (colonIndex > 0) {
    const sliced = cs.slice(0, colonIndex);
    return [[{ type: 'raw', value: sliced }, cs.slice(colonIndex + 1)]];
  }
  const endRuleIndex = cs.indexOf('}');
  const sliced = cs.slice(0, endRuleIndex);
  return [[{ type: 'raw', value: sliced }, cs.slice(endRuleIndex)]];
});
