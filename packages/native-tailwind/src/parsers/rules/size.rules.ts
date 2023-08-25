import * as P from '@universal-labs/css/parser';
import {
  matchAxisXYSegments,
  matchLongTRBLSegment,
  matchMaybeNegative,
  matchTwSegment,
} from '../common.parsers';

// minWidth and minHeight
const matchWHPrefix = P.choice([P.literal('w-'), P.literal('h-')]);
export const matchMinRules = P.sequenceOf([P.literal('min-'), matchWHPrefix]);

// Display flex - none
export const matchDisplayRules = P.choice([P.literal('hidden'), P.literal('flex')]);

// overflow
const matchOverflowValues = P.choice([
  P.literal('hidden'),
  P.literal('visible'),
  P.literal('scroll'),
]);
export const matchOverflowRules = P.sequenceOf([
  P.literal('overflow-'),
  P.maybe(P.sequenceOf([matchAxisXYSegments, P.char('-')])),
  matchOverflowValues,
]);

// Positions
export const matchPositionRules = P.choice([P.literal('relative'), P.literal('absolute')]);
export const matchPositionAxisRules = P.sequenceOf([
  matchMaybeNegative,
  matchLongTRBLSegment,
  P.char('-'),
  matchTwSegment,
]);
