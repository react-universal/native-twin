import type { AnyStyle } from '../../../types/rn.types';
import { choice } from '../../common/choice.parser';
import { parseDeclarationProperty, separatedByComma } from '../../common/composed.parsers';
import { coroutine } from '../../common/coroutine.parser';
import { many } from '../../common/many.parser';
import { maybe } from '../../common/maybe.parser';
import { peek } from '../../common/peek.parser';
import { ident, char, whitespace } from '../../common/string.parser';
import { getPropertyValueType } from '../../utils.parser';
import { ParseCssDimensions } from '../dimensions.parser';
import {
  ParseFlexValue,
  ParseCssColor,
  ParseRotateValue,
  ParseShadowValue,
  ParseTranslateValue,
  ParseAspectRatio,
  ParseSkewValue,
} from './values';

export const ParseCssDeclarationLine = coroutine((run) => {
  const getValue = () => {
    const property = run(parseDeclarationProperty);
    const meta = getPropertyValueType(property);
    if (meta == 'DIMENSION') {
      return {
        [kebab2camel(property)]: run(ParseCssDimensions),
      };
    }
    if (meta == 'FLEX') {
      return run(ParseFlexValue);
    }

    if (meta == 'SHADOW') {
      return run(ParseShadowValue);
    }

    if (meta == 'MATH') {
      return run(ParseAspectRatio);
    }

    if (meta == 'TRANSFORM') {
      return {
        transform: run(choice([ParseTranslateValue, ParseRotateValue, ParseSkewValue])),
      };
    }

    if (meta == 'COLOR') {
      const value = run(ParseCssColor);
      return {
        [kebab2camel(property)]: value,
      };
    }

    //CSS:  .font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}

    if (meta == 'FIRST-COMMA-IDENT') {
      const value = separatedByComma(many(choice([ident, whitespace, char('"')]))).map((x) => {
        return x;
      });
      return {
        [kebab2camel(property)]: run(value)[0]![0],
      };
    }
    return {
      [kebab2camel(property)]: run(ident),
    };
  };

  const composeValue = (result: AnyStyle = {}): AnyStyle => {
    run(maybe(char(';')));
    const isValid = run(peek) !== '}' || run(peek) == '"';
    if (!isValid) return result;
    let value = {
      ...result,
      ...getValue(),
    };
    if (run(peek) == ';') {
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
