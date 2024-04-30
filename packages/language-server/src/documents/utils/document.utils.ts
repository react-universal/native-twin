import * as Option from 'effect/Option';
import ts from 'typescript';
import { Matcher, match } from '../../utils/match';

export function getTemplateLiteralNode(
  source: ts.SourceFile,
  cursorOffset: number,
  sourceMatchers: Matcher[],
) {
  let template:
    | ts.StringLiteralLike
    | ts.TemplateLiteral
    | ts.NoSubstitutionTemplateLiteral
    | undefined;
  // getTokenAtPosition is not really public but widely used. May break in a future version.
  let token = (ts as any).getTokenAtPosition(source, cursorOffset);

  if (ts.isStringLiteralLike(token) && ts.isBinaryExpression(token.parent)) {
    return Option.none();
  }

  while (token) {
    if (
      token.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
      token.kind === ts.SyntaxKind.TemplateExpression ||
      token.kind === ts.SyntaxKind.StringLiteral
    ) {
      template = token;
    }

    token = token.parent;
  }

  return Option.fromNullable(template).pipe(
    Option.flatMap((x) => {
      let currentNode: ts.Node = x;
      while (currentNode && !ts.isSourceFile(currentNode)) {
        const matched = match(currentNode, sourceMatchers);
        if (matched) {
          return Option.some(x);
        }

        if (ts.isCallLikeExpression(currentNode)) {
          return Option.none();
        }

        // TODO stop conditions
        currentNode = currentNode.parent;
      }
      return Option.none();
    }),
  );
}
