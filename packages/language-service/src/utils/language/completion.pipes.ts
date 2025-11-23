import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import type { TwinRuleCompletion } from '../../internal/TwinTypes.internal.js';
import type {
  TemplateTokenData,
  TemplateTokenWithText,
} from '../../models/template-token.model.js';
import { getFlattenTemplateToken } from './language.utils.js';

export const getCompletionsForTokens = (tokens: TemplateTokenData[], completions: TwinRuleCompletion[]) => {
  const resolvers = tokens.map(createCompletionTokenResolver);
  return pipe(
    completions,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x: any) => resolvers.some((y) => y(x))),
  );
};

export const findExactTokenFromTemplateNode = (
  token: TemplateTokenWithText,
  cursorOffset: number,
) =>
  pipe(
    token,
    getFlattenTemplateToken,
    ReadonlyArray.findFirst(
      (y) => cursorOffset >= y.token.bodyLoc.start && cursorOffset <= y.token.bodyLoc.end,
    ),
  );

/** File Private */
const createCompletionTokenResolver =
  (node: TemplateTokenData) => (twinRule: TwinRuleCompletion) => {
    const tokenClassName = node.getTokenClassName();
    if (
      !tokenClassName.includes('/') &&
      twinRule.rule.themeSection === 'colors' &&
      twinRule.completion.className.includes('/')
    ) {
      return false;
    }
    return twinRule.completion.className.startsWith(tokenClassName);
  };
