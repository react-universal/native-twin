import {
  betweenBrackets,
  betweenParens,
  parseDeclarationProperty,
} from '../parsers/composed.parsers';
import { coroutine } from '../parsers/coroutine.parser';
import { getData, setData } from '../parsers/data.parser';
import { maybe } from '../parsers/maybe.parser';
import { peek } from '../parsers/peek.parser';
import { sequenceOf } from '../parsers/sequence-of';
import { skip } from '../parsers/skip.parser';
import { char, everyCharUntil, literal, whitespace } from '../parsers/string.parser';
import type { CssParserData } from '../types/parser.types';
import type { FinalSheet } from '../types/rn.types';
import { ParseCssDeclarationLine } from './declarations.parser';
import { ParseCssDimensions } from './dimensions.parser';
import { ParseSelectorStrict } from './selector.parser';

export const ParseCssRules = coroutine((run) => {
  const result = guessNextRule();
  return result;

  function guessNextRule(
    result: FinalSheet = {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
    },
  ): FinalSheet {
    const nextToken = run(maybe(peek));
    if (!nextToken) {
      return result;
    }
    const currentData = run(getData);
    if (nextToken == '@') {
      const payload = run(ParseCssAtRule);
      if (!payload) return guessNextRule(result);
      result = {
        ...result,
        [payload.selector.value.group]: {
          ...result[payload.selector.value.group],
          ...payload?.declarations,
        },
      };
      run(
        setData({
          ...currentData,
          styles: {
            ...currentData.styles,
            ...result,
          },
        }),
      );
      return guessNextRule(result);
    }
    const payload = run(ParseCssRuleBlock);
    result = {
      ...result,
      [payload?.selector.value.group]: {
        ...result[payload?.selector.value.group],
        ...payload?.declarations,
      },
    };
    run(
      setData({
        ...currentData,
        styles: {
          ...currentData.styles,
          ...result,
        },
      }),
    );
    return guessNextRule(result);
  }
});

const GetAtRuleConditionToken = sequenceOf([parseDeclarationProperty, ParseCssDimensions]);
const SkipRules = sequenceOf([skip(everyCharUntil('}')), char('}')]);

const ParseCssRuleBlock = coroutine((run) => {
  const selector = run(ParseSelectorStrict);
  const platformSelector = selector.value.pseudoSelectors.find(
    (item) => item == 'ios' || item == 'android' || item == 'web',
  );
  const data = run(getData);
  if (platformSelector) {
    if (!selector.value.pseudoSelectors.some((item) => item == data.context.platform)) {
      run(SkipRules);
      return {
        selector,
        declarations: {},
      };
    }
  }
  const appearanceSelector = selector.value.pseudoSelectors.find(
    (item) => item == 'dark' || item == 'light',
  );
  if (appearanceSelector) {
    if (!selector.value.pseudoSelectors.some((item) => item == data.context.colorScheme)) {
      run(SkipRules);
      return {
        selector,
        declarations: {},
      };
    }
  }
  const cache = data.cache.get(selector.value.selectorName);
  if (cache) {
    run(SkipRules);
    return {
      selector,
      declarations: cache,
    };
  }
  const declarations = run(betweenBrackets(ParseCssDeclarationLine));
  data.cache.set(selector.value.selectorName, declarations);
  return {
    selector,
    declarations,
  };
});

const ParseCssAtRule = coroutine((run) => {
  const context = run(getData);
  run(literal('@media'));
  run(whitespace);
  const mediaRuleConstrains = run(betweenParens(GetAtRuleConditionToken));
  if (
    evaluateMediaQueryConstrains(
      { property: mediaRuleConstrains[0], value: mediaRuleConstrains[1] },
      context,
    )
  ) {
    const rule = run(betweenBrackets(ParseCssRuleBlock));
    return rule;
  }
  return null;
});

const evaluateMediaQueryConstrains = (
  node: {
    value: number;
    property: string;
  },
  data: CssParserData,
) => {
  if (typeof node.value == 'number') {
    const value = node.value;
    let valueNumber = typeof value == 'number' ? value : parseFloat(value);
    if (node.property == 'width') {
      return data.context.deviceWidth == valueNumber;
    }

    if (node.property == 'height') {
      return data.context.deviceHeight == valueNumber;
    }

    if (node.property == 'min-width') {
      return data.context.deviceWidth >= valueNumber;
    }

    if (node.property == 'max-width') {
      return data.context.deviceWidth <= valueNumber;
    }

    if (node.property == 'min-height') {
      return data.context.deviceHeight >= valueNumber;
    }

    if (node.property == 'max-height') {
      return data.context.deviceHeight <= valueNumber;
    }
  }
  return true;
};
