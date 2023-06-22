import * as parser from '../';
import { DimensionsToken } from './dimensions.token';

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

const concatDimensions = DimensionsToken.chain((x) =>
  parseOperationSymbols.chain((op) =>
    parser.validNumber.chain((y) => {
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

export const CalcToken = parser
  .literal('calc')
  .chain((_) => parser.betweenParens(concatDimensions));
