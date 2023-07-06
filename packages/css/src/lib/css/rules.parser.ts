import { evaluateMediaQueryConstrains } from '../../evaluators/at-rule.evaluator';
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
