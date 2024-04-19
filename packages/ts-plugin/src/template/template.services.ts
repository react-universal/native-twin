import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'typescript';
import {
  TemplateContext,
  TemplateSettings,
} from 'typescript-template-language-service-decorator';
import { relative } from 'typescript-template-language-service-decorator/lib/nodes';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { TSPluginService } from '../plugin/ts-plugin.context';
import { match, getSourceMatchers } from '../utils/match';
import { Matcher } from '../utils/match';
import { getValidTemplateNode, StandardTemplateContext } from './template.utils';

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
      node: Option.Option<
        ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
      >,
      position: number,
    ) => Option.Option<TemplateContext>;
    getTemplateSettings: () => TemplateSettings;
    getRelativePosition: (
      context: TemplateContext,
      offset: number,
    ) => ts.LineAndCharacter;
  }
>() {}

export const createTemplateService = (
  typescript: typeof ts,
  info: ts.server.PluginCreateInfo,
) =>
  Layer.scoped(
    TemplateSourceHelperService,
    Effect.gen(function* ($) {
      const helper = new StandardScriptSourceHelper(typescript, info.project);
      const main = yield* $(TSPluginService);
      const sourceMatchers = getSourceMatchers(typescript, main.plugin.config);

      return {
        helper,
        sourceMatchers,
        getRelativePosition(context, offset) {
          const baseLC = helper.getLineAndChar(
            context.fileName,
            context.node.getStart() + 1,
          );
          const cursorLC = helper.getLineAndChar(context.fileName, offset);
          return relative(baseLC, cursorLC);
        },
        getTemplateSettings() {
          return {
            get tags() {
              return main.plugin.config.tags;
            },
            enableForStringWithSubstitutions: true,
            getSubstitution(_, start, end) {
              return `\${${'x'.repeat(end - start - 3)}}`;
            },
          };
        },

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

        getTemplateContext(node, position) {
          return node.pipe(
            Option.flatMap((x) => {
              if (position <= x.pos) {
                return Option.none();
              }

              // Make sure we are not inside of a placeholder
              if (ts.isTemplateExpression(x)) {
                let start = x.head.end;
                for (const child of x.templateSpans.map((x) => x.literal)) {
                  const nextStart = child.getStart();
                  if (position >= start && position <= nextStart) {
                    return Option.none();
                  }
                  start = child.getEnd();
                }
              }

              const fileName = x.getSourceFile().fileName;

              return Option.some(
                new StandardTemplateContext(
                  ts,
                  fileName,
                  x,
                  helper,
                  this.getTemplateSettings(),
                ) as TemplateContext,
              );
            }),
          );
        },
      };
    }),
  );
