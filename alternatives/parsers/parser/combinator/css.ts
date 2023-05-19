import { matchMany } from '../composers/many';
import { matchSequenceOf } from '../composers/sequence';
import { matchCssComment } from './comments';
import { matchCssDeclarations } from './declarations';
import { matchCssSelector } from './selector';

export const fullRuleMatch = matchMany(
  matchSequenceOf([matchCssComment, matchCssSelector, matchCssDeclarations]),
).map((result: any) => {
  return {
    value: {
      type: 'rules',
      value: result.map((rule: any) => {
        return {
          type: 'rule',
          value: {
            comment: rule[0],
            selector: rule[1],
            declarations: rule[2],
          },
        };
      }),
    },
    type: 'stylesheet',
  };
});
console.log('0asdsad')