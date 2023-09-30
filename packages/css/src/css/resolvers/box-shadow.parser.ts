import type { ShadowStyleIOS } from 'react-native';
import * as P from '@universal-labs/arc-parser';
import { ParseCssDimensions } from '../dimensions.parser';
import { ParseCssColor } from './color.parser';

// <width> <height> <radius> <spread-radius> <color>
const ShadowValues = P.sequenceOf([
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

export const ParseShadowValue = P.sequenceOf([
  ShadowValues,
  ParseCssColor,
  P.skip(P.char(',')),
  P.skip(ShadowValues),
  P.skip(ParseCssColor),
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
