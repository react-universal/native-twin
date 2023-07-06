import { evaluateDimensionsNode } from '../../evaluators/dimensions.evaluator';
import { resolveCssCalc } from '../../helpers';
import { between } from '../common/between.parser';
import { choice } from '../common/choice.parser';
import { parseDeclarationUnit, parseMathOperatorSymbol } from '../common/composed.parsers';
import { maybe } from '../common/maybe.parser';
import { float } from '../common/number.parser';
import { recursiveParser } from '../common/recursive.parser';
import { sequenceOf } from '../common/sequence-of';
import { char, literal, whitespace } from '../common/string.parser';

export const ParseCssDimensions = recursiveParser(() =>
  choice([ParseDimensionWithUnits, ParseCssCalc]),
);
// 1.2rem calc(1.2rem *)
const ParseDimensionWithUnits = sequenceOf([float, maybe(parseDeclarationUnit)]).mapFromData(
  (x) =>
    evaluateDimensionsNode(
      {
        units: x.result[1] ?? 'none',
        value: parseFloat(x.result[0]),
      },
      x.data,
    ),
);

const ParseCssCalc = sequenceOf([
  literal('calc'),
  char('('),
  ParseDimensionWithUnits,
  between(whitespace)(whitespace)(parseMathOperatorSymbol),
  ParseDimensionWithUnits,
  char(')'),
]).mapFromData((x) => {
  return resolveCssCalc(x.result[2], x.result[3], x.result[4]);
});
