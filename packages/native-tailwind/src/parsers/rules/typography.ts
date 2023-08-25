import * as P from '@universal-labs/css/parser';
import { matchAllTwSegments, matchTwSegment } from '../common.parsers';

const textPrefix = P.literal('text-');
const matchTextUtilities = P.sequenceOf([
  textPrefix,
  P.choice([matchTwSegment, matchAllTwSegments]),
]);

const fontPrefix = P.literal('font-');
const matchFontUtilities = P.sequenceOf([
  fontPrefix,
  P.choice([matchAllTwSegments, matchTwSegment]),
]);

export const matchTypographyUtils = P.choice([matchTextUtilities, matchFontUtilities]);
