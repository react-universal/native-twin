import * as parser from '../Parser';
import { getSelectorGroup } from '../../interpreter/utils';
import type { CssDeclarationValueNode, SelectorGroup } from '../../types';
import { parseDeclarationProperty, parseRawDeclarationValue, parseRule } from './rule.token';
import { parseSelector } from './selector.tokenizer';

export interface ParsedRuleNode {
  type: 'rule';
  selector: string;
  group: SelectorGroup;
  declarations: [string, CssDeclarationValueNode][];
}

const mediaQueryToken = () => parser.token(parser.literal('@media'));

// '@media (min-width:640px){.sm\\:text-lg{font-size:1.125rem;line-height:1.75rem}}'
export const parseAtRule = mediaQueryToken().chain((x) => {
  console.log('MEDIA_RULE_START: ', x);
  return parser.space.chain((y) => {
    console.log('MEDIA_RULE_SPACE: ', y);
    return parser
      .betweenParens(parser.sequence(parseDeclarationProperty, parseRawDeclarationValue))
      .chain((z) => {
        console.log('CONDITION: ', z);
        return parser
          .betweenBrackets(parser.sequence(parseSelector, parseRule))
          .chain((rule) => {
            console.log('RULE: ', rule);
            return parser.unit([rule[0], rule[1]]);
          });
      });
  });
});

export const parseCssToRuleNodes = parser
  .choice([parser.sequence(parseSelector, parseRule), parseAtRule])
  .map((x) => ({
    type: 'rule',
    selector: x[0],
    group: getSelectorGroup(x[0]),
    declarations: x[1],
  }));
