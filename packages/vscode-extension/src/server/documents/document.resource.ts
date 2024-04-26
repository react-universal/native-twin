import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, Range } from 'vscode-languageserver/node';

export interface DocumentTemplateNode {
  node: ts.TemplateLiteral;
  templateTextRange: Range;
  templateStart: number;
  templateEnd: number;
}
export class DocumentResource extends Data.TaggedClass('DocumentResource')<{
  readonly document: TextDocument;
  // readonly getSource: Option.Option<ts.SourceFile>
}> {
  get fullText() {
    return this.document.getText();
  }

  get getDocumentSource() {
    return ts.createSourceFile(
      this.document.uri,
      this.document.getText(),
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ true,
    );
  }

  getTemplateNodeAtPosition(position: Position): Option.Option<DocumentTemplateNode> {
    const cursorOffset = this.document.offsetAt(position);
    let templateStart = 0;
    let templateEnd = 0;

    const source = this.getDocumentSource;

    let template: ts.TemplateLiteral | ts.NoSubstitutionTemplateLiteral | undefined;
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
      this.document.positionAt(templateStart),
      this.document.positionAt(templateEnd),
    );
    return Option.some({
      node: template,
      templateTextRange,
      templateStart,
      templateEnd,
    });
  }
}
