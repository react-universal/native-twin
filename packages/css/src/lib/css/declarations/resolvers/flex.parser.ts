import type { FlexStyle } from 'react-native';
import { maybe } from '../../../common/maybe.parser';
import { sequenceOf } from '../../../common/sequence-of';
import { ParseCssDimensions } from '../../dimensions.parser';

/* flex-grow | flex-shrink | flex-basis */
export const ParseFlexValue = sequenceOf([
  ParseCssDimensions,
  maybe(ParseCssDimensions),
  maybe(ParseCssDimensions),
]).map(
  ([flexGrow, flexShrink, flexBasis]): FlexStyle => ({
    flexGrow,
    flexShrink: flexShrink ?? flexGrow,
    flexBasis: flexBasis ?? '0%',
  }),
);
