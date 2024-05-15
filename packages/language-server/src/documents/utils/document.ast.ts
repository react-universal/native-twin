import ts from 'typescript';
import { Matcher } from '../../utils/match';

export const sourceVisitor = (
  source: ts.SourceFile,
  sourceMatchers: Matcher[],
  onMatch: (node: ts.Node) => void,
) => {
  source.forEachChild(visitNode);

  function visitNode(node: ts.Node) {
    // KIND 244
    if (ts.isExpressionStatement(node)) {
      node.forEachChild(visitNode);
    }
    // KIND 214
    if (ts.isCallExpression(node)) {
      node.forEachChild(visitNode);
    }

    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      onMatch(node);
    }

    node.forEachChild(visitNode);
  }
};
