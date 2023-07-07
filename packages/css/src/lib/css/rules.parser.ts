import type { CssParserData } from '../../types';
import { choice } from '../common/choice.parser';
import {
  betweenBrackets,
  betweenParens,
  parseDeclarationProperty,
} from '../common/composed.parsers';
import { coroutine } from '../common/coroutine.parser';
import { getData } from '../common/data.parser';
import { recursiveParser } from '../common/recursive.parser';
import { sequenceOf } from '../common/sequence-of';
import { literal, whitespace } from '../common/string.parser';
import { ParseCssDeclarationLine } from './declarations';
import { ParseCssDimensions } from './dimensions.parser';
import { ParseCssSelector } from './selector.parser';

/*
 ************ RULE BLOCK ***********
 */

export const ParseCssRules = recursiveParser(() =>
  choice([ParseCssAtRule, ParseCssRuleBlock]),
);

const GetAtRuleConditionToken = sequenceOf([parseDeclarationProperty, ParseCssDimensions]);

const ParseCssRuleBlock = sequenceOf([
  ParseCssSelector,
  betweenBrackets(ParseCssDeclarationLine),
]).map((x) => {
  return {
    selector: x[0],
    declarations: x[1],
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
