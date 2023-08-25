import * as P from '@universal-labs/css/parser';
import { matchMaybeNegative, matchTwSegment } from '../common.parsers';

const marginOrPadding = P.choice([P.literal('p-'), P.literal('m-')]);
export const matchPaddingOrMargin = P.sequenceOf([
  matchMaybeNegative,
  marginOrPadding,
  matchTwSegment,
]);
