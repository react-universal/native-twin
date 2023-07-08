import { maybe } from '../../parsers/maybe.parser';
import { sequenceOf } from '../../parsers/sequence-of';
import { char, literal } from '../../parsers/string.parser';
import type { AnyStyle } from '../../types/rn.types';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseTranslateValue = sequenceOf([
  literal('translate'),
  char('('),
  ParseCssDimensions,
  maybe(literal(', ')),
  maybe(ParseCssDimensions),
  char(')'),
]).mapFromData((x) => {
  const styles: AnyStyle['transform'] = [{ translateX: x.result[2] }];
  if (x.result[4]) {
    styles.push({
      translateY: x.result[4],
    });
  }
  return styles;
});
