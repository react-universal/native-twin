import type { AnyStyle } from '../../../css.types';
import { kebab2camel } from '../../../helpers';
import { choice } from '../../common/choice.parser';
import { parseDeclarationProperty } from '../../common/composed.parsers';
import { coroutine } from '../../common/coroutine.parser';
import { maybe } from '../../common/maybe.parser';
import { peek } from '../../common/peek.parser';
import { ident, char } from '../../common/string.parser';
import { getPropertyValueType } from '../../utils.parser';
import { ParseCssDimensions } from '../dimensions.parser';
import {
  ParseFlexValue,
  ParseCssColor,
  ParseRotateValue,
  ParseShadowValue,
  ParseTranslateValue,
} from './values';

export const ParseCssDeclarationLine = coroutine((run) => {
  const getValue = () => {
    const property = run(parseDeclarationProperty);
    const meta = getPropertyValueType(property);
    if (meta === 'DIMENSION') {
      return {
        [kebab2camel(property)]: run(ParseCssDimensions),
      };
    }
    if (meta === 'FLEX') {
      return run(ParseFlexValue);
    }

    if (meta === 'SHADOW') {
      return run(ParseShadowValue);
    }

    if (meta === 'TRANSFORM') {
      return {
        transform: run(choice([ParseTranslateValue, ParseRotateValue])),
      };
    }

    if (meta === 'COLOR') {
      const value = run(ParseCssColor);
      return {
        [kebab2camel(property)]: value,
      };
    }
    return {
      [kebab2camel(property)]: run(ident),
    };
  };

  const composeValue = (result: AnyStyle = {}): AnyStyle => {
    run(maybe(char(';')));
    const isValid = run(peek) !== '}';
    if (!isValid) return result;
    let value = {
      ...result,
      ...getValue(),
    };
    if (run(peek) === ';') {
      return composeValue(value);
    }
    return value;
  };

  return composeValue();
});
