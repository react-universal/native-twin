import * as P from '@native-twin/arc-parser';
import type { AnyStyle } from '../../react-native/rn.types';
import { getPropertyValueType } from '../../utils.parser';
import { ident } from '../css-common.parser';
import { ParseCssDimensions } from './dimensions.parser';
import { ParseAspectRatio } from './resolvers/aspect-ratio.parser';
import { ParseShadowValue } from './resolvers/box-shadow.parser';
import { ParseCssColor } from './resolvers/color.parser';
import { ParseFlexValue } from './resolvers/flex.parser';
import { ParseRotateValue } from './resolvers/rotate.parser';
import { ParseSkewValue } from './resolvers/skew.parser';
import { ParseTranslateValue } from './resolvers/translate.parser';

export const ParseCssDeclarationLine = P.coroutine((run) => {
  const getValue = () => {
    const property = run(parseDeclarationProperty);
    const meta = getPropertyValueType(property);
    if (meta === 'dimension') {
      return {
        [kebab2camel(property)]: run(ParseCssDimensions),
      };
    }
    if (meta === 'flex') {
      return run(ParseFlexValue);
    }

    if (meta === 'shadow') {
      return run(ParseShadowValue);
    }

    if (meta === 'unitless') {
      return run(ParseAspectRatio);
    }

    if (meta === 'transform') {
      return {
        transform: run(P.choice([ParseTranslateValue, ParseRotateValue, ParseSkewValue])),
      };
    }

    if (meta === 'color') {
      const value = run(ParseCssColor);
      return {
        [kebab2camel(property)]: value,
      };
    }

    if (meta === 'unknown') {
      const value = P.separatedByComma(P.many(P.choice([ident, P.whitespace, P.char('"')]))).map(
        (x) => {
          return x;
        },
      );
      return {
        [kebab2camel(property)]: run(value)[0]![0],
      };
    }
    return {
      [kebab2camel(property)]: run(ident),
    };
  };

  const composeValue = (result: AnyStyle = {}): AnyStyle => {
    run(P.maybe(P.char(';')));
    const isValid = run(P.peek) !== '}' || run(P.peek) === '"';
    if (!isValid) return result;
    const value = {
      ...result,
      ...getValue(),
    };
    if (run(P.peek) === ';') {
      return composeValue(value);
    }
    return value;
  };

  return composeValue();
});

function kebab2camel(input: string) {
  if (!input.includes('-')) return input;
  return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
}

export const parseDeclarationProperty = P.sequenceOf([ident, P.char(':')]).map((x) => x[0]);
