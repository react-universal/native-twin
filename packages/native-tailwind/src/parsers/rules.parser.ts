import * as P from '@universal-labs/css/parser';
import { RuleHandler } from '../theme/entities/Rule';

export function createRuleParser(rules: RuleHandler[]) {
  return P.choice(rules.map((x) => x.parser()));
}
