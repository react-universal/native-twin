import type { EvaluatorConfig } from '../types';
import * as P from './Parser';
import { evaluateMediaQueryConstrains } from './evaluators/at-rule.evaluator';
import { declarationAsStyle } from './evaluators/declaration.evaluator';
import { DeclarationTokens } from './tokens/Declaration.token';
import { SelectorToken } from './tokens/Selector.token';
import {
  GetAtRuleConditionToken,
  GetAtRuleRules,
  GetMediaRuleIdentToken,
} from './tokens/at-rule.token';

export const CssParserRoutine = (target: string, context: EvaluatorConfig) =>
  P.coroutine((run) => {
    const declarations: Record<string, any> = {};
    const firstChar = run(P.peek);
    if (firstChar === '@') {
      run(GetMediaRuleIdentToken);
      const mediaRuleConstrains = run(GetAtRuleConditionToken);
      if (evaluateMediaQueryConstrains(mediaRuleConstrains, context)) {
        const rule = run(GetAtRuleRules);
        rule.declarations.forEach((declaration) => {
          const style = declarationAsStyle(declaration, context);
          Object.assign(declarations, style);
        });
        return { declarations, selector: rule.selector };
      }
      return { declarations, selector: '' };
    }
    const selector = run(SelectorToken);

    run(DeclarationTokens).forEach((declaration) => {
      const style = declarationAsStyle(declaration, context);
      Object.assign(declarations, style);
    });

    return { selector, declarations };
  }).run(target);
