import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { StandardTemplateContext } from './template-node.context';
import { TemplateSourceHelperService } from './template.services';

export const isTaggedTemplateExpression = (
  node: ts.Node,
): Effect.Effect<Option.Option<ts.Node>> => {
  return Effect.succeed(node).pipe(
    Effect.when(() => ts.isTaggedTemplateExpression(node)),
  );
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

export function getTemplateContext(
  node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression,
  position: number,
): Effect.Effect<Option.Option<TemplateContext>, never, TemplateSourceHelperService> {
  return Effect.gen(function* ($) {
    const templateContext = yield* $(TemplateSourceHelperService);
    const fileName = node.getSourceFile().fileName;
    if (!node) {
      return Option.none();
    }

    // Make sure we are inside the template string
    if (position <= node.pos) {
      return Option.none();
    }

    // Make sure we are not inside of a placeholder
    if (ts.isTemplateExpression(node)) {
      let start = node.head.end;
      for (const child of node.templateSpans.map((x) => x.literal)) {
        const nextStart = child.getStart();
        if (position >= start && position <= nextStart) {
          return Option.none();
        }
        start = child.getEnd();
      }
    }

    return Option.some(
      new StandardTemplateContext(
        ts,
        fileName,
        node,
        templateContext.helper,
        templateContext.getTemplateSettings(),
      ) as TemplateContext,
    );
  });
}
