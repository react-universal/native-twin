import * as ts from 'typescript';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver/node';

export function getTemplateTS(doc: TextDocument, tokenPosition: Position) {
  const cursorOffset = doc.offsetAt(tokenPosition);
  let templateStart = 0;
  let templateEnd = 0;
  // Default JS and TS to proper tokenizing instead of regexp matching
  const source = ts.createSourceFile(
    doc.uri,
    doc.getText(),
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
  );

  // Find the outermost template literal
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
  }

  return {
    templateStart,
    templateEnd,
  };
}
