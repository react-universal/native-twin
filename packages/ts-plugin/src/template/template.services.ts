import { SubscriptionRef } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { TemplateSettings } from 'typescript-template-language-service-decorator';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import {
  ConfigurationContext,
  TailwindPluginConfiguration,
} from '../config-manager/configuration.context';
import { match, Matcher } from '../utils/match';
import { getSourceMatchers } from './source-matcher';

export class TemplateSourceHelperService extends Context.Tag('ts/template/source-helper')<
  TemplateSourceHelperService,
  {
    helper: StandardScriptSourceHelper;
    sourceMatchers: Matcher[];
    getTemplateNode: (
      fileName: string,
      position: number,
    ) => Option.Option<
      ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
    >;
    getTemplateContext: (
      fileName: string,
      node: Option.Option<
        ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
      >,
    ) => Option.Option<TemplateContext>;
  }
>() {}

export const TemplateSourceHelperServiceLiveProvider = (
  typescript: typeof ts,
  info: ts.server.PluginCreateInfo,
) =>
  Layer.scoped(
    TemplateSourceHelperService,
    Effect.gen(function* ($) {
      const helper = new StandardScriptSourceHelper(typescript, info.project);
      const configContext = yield* $(ConfigurationContext);
      const configRef = yield* $(SubscriptionRef.get(configContext.config));
      const sourceMatchers = getSourceMatchers(typescript, configRef);
      return {
        helper,
        sourceMatchers,
        getTemplateNode(fileName, position) {
          const node = helper.getNode(fileName, position);
          return Option.fromNullable(node).pipe(
            Option.flatMap((x) => {
              const validNode = getValidTemplateNode(x);
              if (!validNode) return Option.none();
              return Option.some(validNode);
            }),
            Option.flatMap((x) => {
              let currentNode: ts.Node = x;

              while (currentNode && !ts.isSourceFile(currentNode)) {
                if (match(currentNode, sourceMatchers)) {
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
            Option.flatMap((x) => (position <= x.pos ? Option.none() : Option.some(x))),
          );
        },
        getTemplateContext() {
          return Option.none();
        },
      };
    }),
  );

export const isTaggedTemplateExpression = (
  node: ts.Node,
): Effect.Effect<Option.Option<ts.Node>> => {
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

export const getTemplateSettings = (
  config: TailwindPluginConfiguration,
): TemplateSettings => ({
  get tags() {
    return config.tags;
  },
  enableForStringWithSubstitutions: true,
  getSubstitution(_, start, end) {
    return `\${${'x'.repeat(end - start - 3)}}`;
  },
});
