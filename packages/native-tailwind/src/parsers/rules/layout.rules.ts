import * as P from '@universal-labs/css/parser';

const aspectRatioSegment = P.choice([
  P.literal('square'),
  P.literal('video'),
  P.literal('ratio'),
]);
export const matchAspectRatioRule = P.sequenceOf([P.literal('aspect-'), aspectRatioSegment]);
