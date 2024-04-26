import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript';
import { Position } from 'vscode-languageclient';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentResource } from '../documents/document.resource';
import { parseTemplate } from '../native-twin/nativeTwin.parser';
import { LocatedGroupToken, TemplateTokenWithText } from './template.types';

interface TemplateNodeShape {
  readonly node:
    | ts.StringLiteral
    | ts.NoSubstitutionTemplateLiteral
    | ts.TemplateExpression;
  readonly document: DocumentResource;
  readonly cursorPosition: number;
  readonly parsedTemplate: TemplateTokenWithText[];
  readonly positions: {
    relative: {
      position: ts.LineAndCharacter;
      offset: number;
    };
    document: {
      start: number;
      end: number;
    };
  };

  // getTokenAtPosition(offset: number): TemplateTokenWithText[];
}

export class TemplateNode extends Data.Class<TemplateNodeShape> {
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

export const acquireTemplateNode = (position: Position, data?: TextDocument) => {
  return pipe(
    Option.fromNullable(data),
    Option.map((x) => {
      return new DocumentResource({ document: x });
    }),
    Option.flatMap((x) => {
      const template = x.getTemplateNodeAtPosition(position);
      if (Option.isNone(template)) return Option.none();

      return Option.some({
        document: x,
        template: template.value,
      });
    }),
    Option.map((x) => {
      const parsed = parseTemplate(
        x.document.document.getText(x.template.templateTextRange),
      );
      const relativeOffset = x.document.document.offsetAt({
        line: position.line,
        character: position.character - x.template.templateTextRange.start.character,
      });
      const relativePosition = x.document.document.positionAt(relativeOffset);
      return new TemplateNode({
        node: x.template.node,
        cursorPosition: position.character,
        parsedTemplate: parsed,
        document: x.document,
        positions: {
          document: {
            start: x.template.templateStart,
            end: x.template.templateEnd,
          },

          relative: {
            offset: relativeOffset,
            position: relativePosition,
          },
        },
      });
    }),
  );
  // return Effect.sync(() => {
  //   const templateContext = templateSvc.getTemplateContext(templateNode, position);
  //   const parsedTemplate = Option.map(templateContext, (x) => parseTemplate(x.text));

  //   return Option.all([templateNode, templateContext, parsedTemplate]).pipe(
  //     Option.map(([node, context, parsed]) => {
  //       const templatePosition = templateSvc.getRelativePosition(
  //         context,
  //         position,
  //         context.text,
  //       );
  //       const textOffset = context.toOffset(templatePosition);
  //       const documentPosition = {
  //         start: context.node.getStart(),
  //         end: context.node.getEnd(),
  //       };
  //       return new TemplateNode({
  //         node,
  //         cursorPosition: position,
  //         templateContext: context,
  //         parsedTemplate: parsed,
  //         positions: {
  //           relative: {
  //             position: templatePosition,
  //             offset: textOffset,
  //           },
  //           document: documentPosition,
  //         },
  //       });
  //     }),
  //   );
  // });
};
