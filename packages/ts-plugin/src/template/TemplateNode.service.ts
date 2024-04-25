import { pipe } from 'effect/Function';
import * as Data from 'effect/Data';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { parseTemplate } from '../native-twin/nativeTwin.parser';
import {
  TemplateNodeService,
  TemplateNodeShape,
  TemplateSourceHelperService,
} from './template.context';
import { LocatedGroupToken } from './template.types';

export class TempleNode extends Data.Class<
  Omit<TemplateNodeShape, 'getTokenAtPosition'>
> {
  getTokenAtPosition(offset: number) {
    return pipe(
      ReadonlyArray.fromIterable(this.parsedTemplate),
      ReadonlyArray.filter((x) => offset >= x.start && offset <= x.end),
      ReadonlyArray.map((x) => {
        if (x.type === 'VARIANT') {
          return {
            ...x,
            type: 'GROUP',
            value: {
              base: x,
              content: [],
            },
            end: x.end,
            start: x.start,
          } satisfies LocatedGroupToken;
        }
        return x;
      }),
    );
  }
}

export const acquireTemplateNode = (
  filename: string,
  position: number,
): Effect.Effect<
  Option.Option<TemplateNodeShape>,
  never,
  TemplateSourceHelperService
> => {
  return Effect.gen(function* ($) {
    const templateSvc = yield* $(TemplateSourceHelperService);
    const templateNode = templateSvc.getTemplateNode(filename, position);

    const templateContext = templateSvc.getTemplateContext(templateNode, position);
    const parsedTemplate = Option.map(templateContext, (x) => parseTemplate(x.text));

    return Option.all([templateNode, templateContext, parsedTemplate]).pipe(
      Option.map(([node, context, parsed]) => {
        const templatePosition = templateSvc.getRelativePosition(context, position);
        const textOffset = context.toOffset(templatePosition);
        const documentPosition = {
          start: context.node.getStart(),
          end: context.node.getEnd(),
        };
        return TemplateNodeService.of({
          node,
          cursorPosition: position,
          templateContext: context,
          parsedTemplate: parsed,
          positions: {
            relative: {
              position: templatePosition,
              offset: textOffset,
            },
            document: documentPosition,
          },
          getTokenAtPosition(offset) {
            return parsed
              .filter((x) => offset >= x.start && offset <= x.end)
              .map((x) => {
                if (x.type === 'VARIANT') {
                  return {
                    ...x,
                    type: 'GROUP',
                    value: {
                      base: x,
                      content: [],
                    },
                    end: x.end,
                    start: x.start,
                  } satisfies LocatedGroupToken;
                }
                return x;
              });
          },
        });
      }),
    );
  });
};
