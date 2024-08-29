import type { FlexStyle } from 'react-native';
import * as P from '@native-twin/arc-parser';
import { ParseCssDimensions } from '../dimensions.parser';

/* flex-grow | flex-shrink | flex-basis */
export const ParseFlexValue = P.sequenceOf([
  ParseCssDimensions,
  P.maybe(ParseCssDimensions),
  P.maybe(ParseCssDimensions),
]).map(
  ([flexGrow, flexShrink, flexBasis]): FlexStyle => ({
    flexGrow,
    flexShrink: flexShrink ?? flexGrow,
    flexBasis: flexBasis ?? '0%',
  }),
);
