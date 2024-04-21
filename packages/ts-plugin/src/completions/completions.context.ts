import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript';
import { IntellisenseService } from '../language/intellisense.service';
import { getTokenAtPosition } from '../template/parser.service';
import { parseTemplate } from '../template/template.parser';
import { TemplateSourceHelperService } from '../template/template.services';
import {
  LocatedGroupTokenWithText,
  TemplateTokenWithText,
} from '../template/template.types';

export const getCompletionsAtPosition = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const helper = yield* $(TemplateSourceHelperService);

    const node = helper.getTemplateNode(filename, position);
    const templateContext = helper.getTemplateContext(node, position);
    const parsedTemplate = Option.map(templateContext, (x) => parseTemplate(x.text)).pipe(
      Option.getOrElse((): TemplateTokenWithText[] => []),
    );

    const positions = Option.map(templateContext, (context) => {
      const templatePosition = helper.getRelativePosition(context, position);
      const textOffset = context.toOffset(templatePosition);
      return {
        templatePosition,
        textOffset,
      };
    });

    const tokenAtPosition = Option.map(positions, (x) => {
      return getTokenAtPosition(parsedTemplate, x.textOffset);
    });

    // console.log('tokenAtPosition: ', tokenAtPosition);

    // const rules = tokensToRules(parsedTemplate);
    // const ruleAtPosition = tokensToRules(tokenAtPosition);

    const completions = Option.zipWith(tokenAtPosition, positions, (token, pos) => {
      return getCompletionsForTokenAtPosition(token, pos.textOffset);
    });
    const data = yield* $(completions, Effect.flatten);

    console.log('rules: ', {
      tokenAtPosition,
      parsedTemplate,
      completions,
      data,
    });

    return [] as ts.CompletionEntry[];
  });
};

const getCompletionsForTokenAtPosition = (
  tokens: TemplateTokenWithText[],
  position: number,
) => {
  return Effect.gen(function* ($) {
    const positionToken = tokens
      .map((x) => getCompletionParts(x))
      .flat()
      .filter((x) => {
        return position >= x.start && position <= x.end;
      });
    const intellisense = yield* $(IntellisenseService);
    const results = ReadonlyArray.map(positionToken, (token) => {
      const completionByToken = Array.from(intellisense.store.twinRules.values()).filter(
        (x) => x.completion.className.startsWith(token.text),
      );

      return completionByToken;
    });

    return results;
  });
};

const getCompletionParts = (
  token: TemplateTokenWithText,
): Exclude<TemplateTokenWithText, LocatedGroupTokenWithText>[] => {
  if (token.type === 'CLASS_NAME') {
    return [token];
  }

  if (token.type === 'ARBITRARY') {
    return [token];
  }
  if (token.type === 'VARIANT') {
    return [token];
  }
  if (token.type === 'VARIANT_CLASS') {
    return [token];
  }
  if (token.type === 'GROUP') {
    const classNames = token.value.content.flatMap((x) => {
      return getCompletionParts(x);
    });
    return classNames;
  }

  return [];
};
