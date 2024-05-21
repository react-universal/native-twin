import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import { NativeTwinManagerService } from '../../native-twin/native-twin.service';
import { TwinRuleCompletion } from '../../native-twin/native-twin.types';
import { TemplateTokenWithText } from '../../template/template.models';
import { TemplateTokenData } from '../models/template-token-data.model';
import { getFlattenTemplateToken } from './language.utils';

const createCompletionTokenResolver =
  (node: TemplateTokenData) => (twinRule: TwinRuleCompletion) =>
    twinRule.completion.className.startsWith(node.getTokenClassName());

export const getCompletionsForTokens = (
  tokens: TemplateTokenData[],
  twinService: NativeTwinManagerService['Type'],
) => {
  const resolvers = tokens.map(createCompletionTokenResolver);
  return pipe(
    twinService.completions.twinRules,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x) => resolvers.some((y) => y(x))),
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
