import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { ParserService } from '../language/parser.service';
import { TSPluginService } from '../plugin/ts-plugin.context';
import {
  getTokenAtPosition,
  locatedParsedRuleLocatedSheetEntry,
} from '../template/template.parser';
import { TemplateSourceHelperService } from '../template/template.services';

export const getCompletionsAtPosition = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const helper = yield* $(TemplateSourceHelperService);
    const { tailwind } = yield* $(TSPluginService);
    const intellisenseService = yield* $(ParserService);

    const node = helper.getTemplateNode(filename, position);
    const templateContext = helper.getTemplateContext(node, position);
    const parsedTemplate = templateContext.pipe(
      Option.flatMap((x) => intellisenseService.parseTemplate(x.text)),
    );
    const tokenAtPosition = Option.zipWith(
      templateContext,
      parsedTemplate,
      (context, parsed) => {
        const templatePosition = helper.getRelativePosition(context, position);
        const textOffset = context.toOffset(templatePosition);
        return getTokenAtPosition(parsed, textOffset);
      },
    );

    const entries = tokenAtPosition.pipe(
      Option.map((x) =>
        x.map((y) => locatedParsedRuleLocatedSheetEntry(y, tailwind.context)),
      ),
    );

    return entries;
  });
};
