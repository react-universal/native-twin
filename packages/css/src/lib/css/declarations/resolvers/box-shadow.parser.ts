import type { ShadowStyleIOS } from 'react-native';
import { sequenceOf } from '../../../common/sequence-of';
import { skip } from '../../../common/skip.parser';
import { char } from '../../../common/string.parser';
import { ParseCssDimensions } from '../../dimensions.parser';
import { ParseCssColor } from './color.parser';

// <width> <height> <radius> <spread-radius> <color>
const ShadowValues = sequenceOf([
  ParseCssDimensions,
  ParseCssDimensions,
  ParseCssDimensions,
  ParseCssDimensions,
]).map(([width, height, radius, opacity]) => ({
  width,
  height,
  radius,
  opacity,
}));

export const ParseShadowValue = sequenceOf([
  ShadowValues,
  ParseCssColor,
  skip(char(',')),
  skip(ShadowValues),
  skip(ParseCssColor),
]).map(
  (result): ShadowStyleIOS => ({
    shadowOffset: {
      width: result[0].width,
      height: result[0].height,
    },
    shadowColor: result[1],
    shadowRadius: result[0].radius,
    shadowOpacity: result[0].opacity,
  }),
);
