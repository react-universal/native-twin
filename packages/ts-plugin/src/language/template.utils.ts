import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import ts from 'typescript';

export const isTaggedTemplateExpression = (node: ts.Node): Effect.Effect<Option.Option<ts.Node>> => {
  return Effect.succeed(node).pipe(Effect.when(() => ts.isTaggedTemplateExpression(node)));
};

export const getValidTemplateNode = (
  node: ts.Node,
): ts.StringLiteralLike | ts.TemplateLiteral | undefined => {
  if (ts.isTaggedTemplateExpression(node)) {
    return getValidTemplateNode(node.template);
  }

  // TODO if templateSettings.enableForStringWithSubstitutions
  if (ts.isTemplateHead(node) || ts.isTemplateSpan(node)) {
    return getValidTemplateNode(node.parent);
  }

  if (ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
    return getValidTemplateNode(node.parent);
  }

  // TODO Identifier, TemplateHead, TemplateMiddle, TemplateTail
  // export type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
  // export type PropertyNameLiteral = Identifier | StringLiteralLike | NumericLiteral;
  if (
    !(
      ts.isStringLiteralLike(node) ||
      ts.isTemplateLiteral(node) ||
      ts.isTemplateExpression(node)
    )
  ) {
    return undefined;
  }

  // Ignore strings that are part of an expression
  // x + '...'
  if (ts.isStringLiteralLike(node) && ts.isBinaryExpression(node.parent)) {
    return undefined;
  }

  return node;
};
