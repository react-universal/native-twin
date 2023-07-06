import type { FlexStyle, ShadowStyleIOS } from 'react-native';
import type { AnyStyle } from '../../../css.types';
import { choice } from '../../common/choice.parser';
import { betweenParens, separatedBySpace } from '../../common/composed.parsers';
import { many, many1 } from '../../common/many.parser';
import { maybe } from '../../common/maybe.parser';
import { sequenceOf } from '../../common/sequence-of';
import { char, ident, literal, whitespace } from '../../common/string.parser';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseCssColor = sequenceOf([
  choice([literal('rgba'), literal('hsl'), literal('#')]),
  betweenParens(many1(choice([ident, char('.'), char(',')])).map((x) => x.join(''))),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});

export const ParseRotateValue = sequenceOf([
  choice([literal('rotateX'), literal('rotateY'), literal('rotateZ'), literal('rotate')]),
  char('('),
  ParseCssDimensions,
  char(')'),
]).mapFromData((x): AnyStyle['transform'] => {
  if (x.result[0] === 'rotateX') {
    return [{ rotateX: `${x.result[2]}` }];
  }
  if (x.result[0] && 'rotateY') {
    return [{ rotateY: `${x.result[2]}` }];
  }

  if (x.result[0] && 'rotateZ') {
    return [{ rotateZ: `${x.result[2]}` }];
  }

  return [{ rotate: `${x.result[2]}` }];
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

export const ParseFlexValue = separatedBySpace(ParseCssDimensions).mapFromData(
  (x): FlexStyle => {
    return x.result.reduce(
      (prev, current, index) => {
        if (index === 0) {
          prev.flexShrink = current;
        }
        if (index === 1) {
          prev.flexShrink = current;
        }
        if (index === 2) {
          prev.flexBasis = current;
        }
        return prev;
      },
      {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
      } as FlexStyle,
    );
  },
);

const DimensionNextSpace = sequenceOf([ParseCssDimensions, whitespace]).map((x) => x[0]);

export const ParseShadowValue = many(
  sequenceOf([
    maybe(literal(', ')),
    // REQUIRED
    DimensionNextSpace,
    // REQUIRED
    sequenceOf([ParseCssDimensions, whitespace]).map((x) => x[0]),
    // OPTIONAL
    maybe(sequenceOf([DimensionNextSpace, DimensionNextSpace, ParseCssColor])),
  ]),
).mapFromData((x): ShadowStyleIOS => {
  const shadow = x.result[0]!;
  return {
    shadowOffset: {
      width: shadow[1],
      height: shadow[2],
    },
    shadowRadius: shadow[3]?.[0] && shadow[3]![0],
    shadowOpacity: shadow[3]?.[1] && shadow[3]![1],
    shadowColor: shadow[3]?.[2],
  };
});
