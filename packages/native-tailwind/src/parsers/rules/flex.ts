import * as P from '@universal-labs/css/parser';
import { matchAxisXYSegments, matchTwSegment } from '../common.parsers';

const flexSegment = P.literal('flex-');

// Flex Direction
const matchFlexDirectionRule = P.sequenceOf([
  flexSegment,
  P.choice([
    P.literal('row-reverse'),
    P.literal('col-reverse'),
    P.literal('row'),
    P.literal('col'),
  ]),
]);

const matchFlexWrapRule = P.sequenceOf([
  flexSegment,
  P.choice([P.literal('wrap-reverse'), P.literal('wrap'), P.literal('nowrap')]),
]);

const matchFlexLevelRule = P.sequenceOf([flexSegment, matchTwSegment]);

// Flex grow / shrink / basis
const matchFlexGrowRule = P.sequenceOf([P.literal('grow-'), matchTwSegment]);
const matchFlexBasisRule = P.sequenceOf([P.literal('basis-'), matchTwSegment]);
const matchFlexShrinkRule = P.sequenceOf([P.literal('shrink-'), matchTwSegment]);

const matchFlexGap = P.sequenceOf([
  P.literal('gap-'),
  P.maybe(P.sequenceOf([matchAxisXYSegments, P.char('-')])),
  matchTwSegment,
]);

// Flex Aligns
const justifyItems = P.sequenceOf([
  P.literal('items-'),
  P.choice([P.literal('start'), P.literal('end'), P.literal('center'), P.literal('stretch')]),
]);
const justifySelf = P.sequenceOf([
  P.literal('self-'),
  P.choice([
    P.literal('center'),
    P.literal('start'),
    P.literal('end'),
    P.literal('stretch'),
    P.literal('auto'),
  ]),
]);

const contentAlign = P.sequenceOf([
  P.literal('content-'),
  P.choice([
    P.literal('center'),
    P.literal('start'),
    P.literal('end'),
    P.literal('between'),
    P.literal('around'),
    P.literal('evenly'),
    P.literal('stretch'),
    P.literal('baseline'),
  ]),
]);

const matchFlexAlign = P.sequenceOf([
  P.literal('justify-'),
  P.choice([
    justifyItems,
    justifySelf,
    P.literal('start'),
    P.literal('end'),
    P.literal('center'),
    P.literal('between'),
    P.literal('around'),
    P.literal('evenly'),
  ]),
]);

// Align Content
// Align Items
// Align Self
const matchFlexAligns = P.choice([justifyItems, justifySelf, contentAlign]);

export const matchFlexUtils = P.choice([
  matchFlexDirectionRule,
  matchFlexWrapRule,
  matchFlexLevelRule,
  matchFlexGrowRule,
  matchFlexBasisRule,
  matchFlexShrinkRule,
  matchFlexGap,
  justifyItems,
  justifySelf,
  contentAlign,
  matchFlexAlign,
  matchFlexAligns,
]);
