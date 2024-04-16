import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, Range } from 'vscode-languageserver/node';

export class DocumentResource extends Data.TaggedClass('DocumentResource')<{
  readonly document: Option.Option<TextDocument>;
  // readonly getSource: Option.Option<ts.SourceFile>
}> {
  get fullText() {
    return this.document.pipe(Option.map((x) => x.getText()));
  }

  getDocumentSource() {
    return this.document.pipe(
      Option.map((x) =>
        ts.createSourceFile(
          x.uri,
          x.getText(),
          ts.ScriptTarget.Latest,
          /*setParentNodes*/ true,
        ),
      ),
    );
  }

  getTemplateContext(position: Position) {
    return this.document.pipe(
      Option.flatMap((x) => {
        const cursorOffset = x.offsetAt(position);
        let templateStart = 0;
        let templateEnd = 0;

        const source = ts.createSourceFile(
          x.uri,
          x.getText(),
          ts.ScriptTarget.Latest,
          /*setParentNodes*/ true,
        );
        let template: ts.TemplateLiteral | undefined;
        // getTokenAtPosition is not really public but widely used. May break in a future version.
        let token = (ts as any).getTokenAtPosition(source, cursorOffset);
        while (token) {
          if (
            token.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
            token.kind === ts.SyntaxKind.TemplateExpression
          ) {
            template = token;
          }
          token = token.parent;
        }
        if (template) {
          templateStart = template.getStart() + 1;
          templateEnd = template.getEnd() - 1;
        } else {
          return Option.none();
        }

        const templateTextRange = Range.create(
          x.positionAt(templateStart),
          x.positionAt(templateEnd),
        );
        return Option.some(x.getText(templateTextRange));
      }),
    );
  }
}
