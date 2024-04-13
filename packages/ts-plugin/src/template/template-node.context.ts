import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import ts from 'typescript';
import { relative } from 'typescript-template-language-service-decorator/lib/nodes';
import { TemplateSourceHelperService } from './template.services';

export class TemplateNodeService extends Context.Tag('ts/template/node')<
  TemplateNodeService,
  {
    /**
     * Map a location from within the template string to an offset within the template string
     */
    toOffset(location: ts.LineAndCharacter): Effect.Effect<number>;
    /**
     * Map an offset within the template string to a location within the template string
     */
    toPosition(offset: number): Effect.Effect<ts.LineAndCharacter>;
  }
>() {}

export const templateNodeServiceProvider = (filename: string, node: ts.TemplateLiteral) =>
  Layer.scoped(
    TemplateNodeService,
    Effect.gen(function* ($) {
      const templateContext = yield* $(TemplateSourceHelperService);

      const stringBodyOffset = node.getStart() + 1;
      const stringBodyPosition = templateContext.helper.getLineAndChar(
        filename,
        stringBodyOffset,
      );

      return {
        toOffset: (position) =>
          Effect.gen(function* ($1) {
            const line = position.line + stringBodyPosition.line;
            const char =
              position.line === 0
                ? stringBodyPosition.character + position.character
                : position.character;

            const docOffset = yield* $1(
              Effect.succeed(templateContext.helper.getOffset(filename, line, char)),
            );

            return docOffset - stringBodyOffset;
          }),

        toPosition: (offset) =>
          Effect.gen(function* ($1) {
            const docPosition = yield* $1(
              Effect.succeed(
                templateContext.helper.getLineAndChar(filename, stringBodyOffset + offset),
              ),
            );

            return relative(stringBodyPosition, docPosition);
          }),
      };
    }),
  );
