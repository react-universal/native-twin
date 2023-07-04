import { parser, string, number } from '../lib';
import type { AstRawValueNode } from '../types';
import { mapAsType } from './utils.parser';

const TopLeftBottomRightParser = <P extends string>(prefix: P) =>
  parser
    .sequenceOf([
      string.literal(prefix),
      string.char('-'),
      parser.choice([
        string.literal('top'),
        string.literal('left'),
        string.literal('bottom'),
        string.literal('right'),
      ]),
    ])
    .map((x) => x.join(''));

const MinMaxParser = <P extends string>(suffix: P) =>
  parser
    .sequenceOf([
      parser.choice([string.literal('min'), string.literal('max')]),
      string.char('-'),
      string.literal(suffix),
    ])
    .map((x) => x.join(''));

const SizeParser = <P extends string>(prefix: P) =>
  parser
    .sequenceOf([string.literal(prefix), string.char('-'), string.literal('size')])
    .map((x) => x.join(''));

export const DimensionProperties = parser
  .choice([
    parser.choice([string.literal('width'), string.literal('height')]),
    parser.choice([MinMaxParser('width'), MinMaxParser('height')]),
    parser.choice([SizeParser('font'), string.literal('line-height')]),
    parser.choice([
      TopLeftBottomRightParser('margin'),
      TopLeftBottomRightParser('border'),
      TopLeftBottomRightParser('padding'),
    ]),
  ])
  .map(mapAsType('DIMENSIONS-PROP'));

const PropertyValidChars = parser
  .many1(parser.choice([number.alphanumeric, string.char('-')]))
  .map((x) => x.join(''))
  .map(mapAsType('UNKNOWN'));

const FlexProperty = string.literal('flex').map(mapAsType('FLEX-PROP'));
const ShadowProperty = string.literal('box-shadow').map(mapAsType('SHADOW-PROP'));

export const ParseDeclarationProperty = parser
  .sequenceOf([
    parser.choice([DimensionProperties, FlexProperty, ShadowProperty, PropertyValidChars]),
    string.char(':'),
  ])
  .map((x) => x[0]);

const _DeclarationRawValueToken = parser
  .many1(parser.choice([string.letters, string.char('-')]))
  .map((x): AstRawValueNode => {
    return {
      type: 'RAW',
      value: x.join(''),
    };
  });
