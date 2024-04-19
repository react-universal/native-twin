import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { TemplateSourceHelperService } from '../template/template.services';
import { getTemplateContext } from '../template/template.utils';
import { getTokenAtPosition, templateParser } from './template.parser';

export const getCompletionsAtPosition = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const parsedTemplate = yield* $(getParsedTemplate(filename, position));

    return parsedTemplate.pipe(
      Option.map((x) => getTokenAtPosition(x.parsed[0], x.textOffset)),
    );
  });
};

export const getParsedTemplate = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const templateContext = yield* $(TemplateSourceHelperService);

    const data = yield* $(
      templateContext.getTemplateNode(filename, position).pipe(
        Option.map((x) => {
          return getTemplateContext(x, position);
        }),
      ),
      Effect.flatten,
      Effect.map(
        pipe(
          Option.map((context) => {
            const templatePosition = templateContext.getRelativePosition(
              context,
              position,
            );
            const textOffset = context.toOffset(templatePosition);
            return {
              textOffset,
              templatePosition,
              context,
              parsed: templateParser(context.text),
            };
          }),
        ),
      ),
    );
    return data;
  });
};
