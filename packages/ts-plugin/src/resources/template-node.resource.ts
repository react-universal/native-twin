import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { getTokenAtPosition } from '../template/parser.service';
import { parseTemplate } from '../template/template.parser';
import { TemplateSourceHelperService } from '../template/template.services';
import { TemplateTokenWithText } from '../template/template.types';

interface TemplateNodeShape {
  node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression;
  position: number;
  context: TemplateContext;
  parsed: TemplateTokenWithText[];
  positions: {
    relative: {
      position: ts.LineAndCharacter;
      offset: number;
    };
    document: {
      start: number;
      end: number;
    };
  };
}

class TemplateNode extends Data.TaggedClass('TemplateNodeService')<TemplateNodeShape> {
  get tokenAtPosition() {
    return getTokenAtPosition(this.parsed, this.positions.relative.offset);
  }
}

export const acquireTemplateNode = (filename: string, position: number) => {
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
        return new TemplateNode({
          node,
          position,
          context,
          parsed,
          positions: {
            relative: {
              position: templatePosition,
              offset: textOffset,
            },
            document: documentPosition,
          },
        });
      }),
    );
  });
};
