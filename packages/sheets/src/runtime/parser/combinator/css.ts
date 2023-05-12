import { parseBefore } from '../composers/before';
import { matchSequenceOf } from '../composers/sequence';
import { matchCssComment } from './comments';
import { matchCssDeclarations } from './declarations';

export const fullRuleMatch = matchSequenceOf([
  matchCssComment,
  parseBefore('{').map((result: any) => {
    return {
      type: 'rule',
      value: result.join(''),
    };
  }),
  matchCssDeclarations,
]).map((result) => {
  return {
    value: {
      comment: result![0],
      selector: result![1],
      declarations: result![2],
    },
    type: 'stylesheet',
  };
});
