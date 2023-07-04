import { evaluateMediaQueryConstrains } from '../evaluators/at-rule.evaluator';
import { composed, parser, string } from '../lib';
import type { CssParserData } from '../types';
import { GetAtRuleConditionToken } from './at-rule.parsers';
import { ParseCssRuleBlock } from './rule-block.parser';
import { SelectorToken } from './selector.parsers';

export const SheetParser = parser.withData(
  parser.coroutine((run) => {
    const context: CssParserData = run(parser.getData);

    const ruleType = getNextRuleType();

    if (ruleType === 'AT-RULE') {
      return {
        selector: { group: 'base', value: '' } as const,
        declarations: getNextMediaRule(),
      };
    }

    const selector = getNextSelector();
    // console.log('SELECTOR: ', selector);
    const declarations = getNextRegularRule();
    // console.log('declarations: ', declarations);

    return { selector, declarations };

    function getNextRuleType() {
      const firstChar = run(parser.peek);
      if (firstChar === '@') return 'AT-RULE';
      return 'RULE';
    }

    function getNextSelector() {
      return run(SelectorToken);
    }

    function getNextMediaRule() {
      run(string.literal('@media'));
      run(string.whitespace);
      const mediaRuleConstrains = run(composed.betweenParens(GetAtRuleConditionToken));
      if (
        evaluateMediaQueryConstrains(
          { property: mediaRuleConstrains[0].value, value: mediaRuleConstrains[1] },
          context,
        )
      ) {
        const rule = run(ParseCssRuleBlock);
        run(parser.debugState('asd', 'asd'));
        return rule;
      }
      return null;
    }

    function getNextRegularRule() {
      return run(ParseCssRuleBlock);
    }
  }),
);
