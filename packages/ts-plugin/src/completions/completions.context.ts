import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { parseTemplate } from '../template/template.parser';
import { TemplateSourceHelperService } from '../template/template.services';
import { getTemplateContext } from '../template/template.utils';

export const getCompletionsAtPosition = (filename: string, position: number) =>
  Effect.gen(function* ($) {
    const templateContext = yield* $(TemplateSourceHelperService);
    const template = yield* $(
      templateContext.getTemplateNode(filename, position).pipe(
        Option.map((x) => {
          return getTemplateContext(x, position);
        }),
      ),
      Effect.flatten,
    );

    return template.pipe(
      Option.map((context) => {
        const templatePosition = templateContext.getRelativePosition(context, position);
        const textOffset = context.toOffset(templatePosition);
        return {
          template: {
            context,
            templatePosition,
            textOffset,
          },
          positionAST: parseTemplate(context.text, textOffset, true),
        };
      }),
    );
  });
