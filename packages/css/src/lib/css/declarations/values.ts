import type { FlexStyle, ShadowStyleIOS } from 'react-native';
import type { AnyStyle } from '../../../css.types';
import { choice } from '../../common/choice.parser';
import {
  betweenParens,
  separatedByComma,
  whitespaceSurrounded,
} from '../../common/composed.parsers';
import { maybe } from '../../common/maybe.parser';
import { float } from '../../common/number.parser';
import { sequenceOf } from '../../common/sequence-of';
import { skip } from '../../common/skip.parser';
import { char, literal } from '../../common/string.parser';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseCssColor = sequenceOf([
  choice([literal('rgba'), literal('hsl'), literal('#')]),
  betweenParens(separatedByComma(float)),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});

export const ParseRotateValue = sequenceOf([
  choice([literal('rotateX'), literal('rotateY'), literal('rotateZ'), literal('rotate')]),
  betweenParens(ParseCssDimensions),
]).map(([key, value]): AnyStyle['transform'] => {
  if (key == 'rotateX') {
    return [{ rotateX: `${value}` }];
  }
  if (key == 'rotateY') {
    return [{ rotateY: `${value}` }];
  }

  if (key == 'rotateZ') {
    return [{ rotateZ: `${value}` }];
  }

  return [{ rotate: `${value}` }];
});

export const ParseTranslateValue = sequenceOf([
  literal('translate'),
  char('('),
  ParseCssDimensions,
  maybe(literal(', ')),
  maybe(ParseCssDimensions),
  char(')'),
]).mapFromData((x) => {
  const styles: AnyStyle['transform'] = [{ translateX: x.result[2] }];
  if (x.result[4]) {
    styles.push({
      translateY: x.result[4],
    });
  }
  return styles;
});

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

// <width> <height> <radius> <spread-radius> <color>
const ManyDimensions = sequenceOf([
  whitespaceSurrounded(ParseCssDimensions),
  whitespaceSurrounded(ParseCssDimensions),
  whitespaceSurrounded(ParseCssDimensions),
  whitespaceSurrounded(ParseCssDimensions),
]).map(([width, height, radius, opacity]) => ({
  width,
  height,
  radius,
  opacity,
}));

export const ParseShadowValue = sequenceOf([
  ManyDimensions,
  ParseCssColor,
  skip(char(',')),
  skip(ManyDimensions),
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
