import type { AnyStyle } from '../../../../types/rn.types';
import { maybe } from '../../../common/maybe.parser';
import { sequenceOf } from '../../../common/sequence-of';
import { char, literal } from '../../../common/string.parser';
import { ParseCssDimensions } from '../../dimensions.parser';

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
