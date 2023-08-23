import type { FlexStyle } from 'react-native';
import { maybe } from '../../parsers/maybe.parser';
import { sequenceOf } from '../../parsers/sequence-of';
import { ParseCssDimensions } from '../dimensions.parser';
import { choice, literal } from '../../parser-module';

/* flex-grow | flex-shrink | flex-basis */
export const ParseFlexValue = choice([
  sequenceOf([
    ParseCssDimensions,
    maybe(ParseCssDimensions),
    maybe(choice([ParseCssDimensions, literal('auto')])),
  ]).map(
    ([flexGrow, flexShrink, flexBasis]): FlexStyle => ({
      flexGrow,
      flexShrink: flexShrink ?? flexGrow,
      flexBasis: flexBasis ?? '0%',
    }),
  ),
  literal('none').map((x) => ({
    flex: x as unknown as number,
  })),
]);
