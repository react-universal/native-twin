import * as P from '@native-twin/arc-parser';
import { AnyStyle } from '../../../react-native/rn.types';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseTranslateValue = P.sequenceOf([
  P.literal('translate'),
  P.char('('),
  ParseCssDimensions,
  P.maybe(P.literal(', ')),
  P.maybe(ParseCssDimensions),
  P.char(')'),
]).mapFromData((x) => {
  const styles: AnyStyle['transform'] = [{ translateX: x.result[2] }];
  if (x.result[4]) {
    styles.push({
      translateY: x.result[4],
    });
  }
  return styles;
});
