import * as t from '@babel/types';
import { CodeGenerator } from '@babel/generator';
import { cx } from '@native-twin/core';
import * as Match from 'effect/Match';
import type { TWParsedRule } from '@native-twin/css';
import { parseTWTokens } from '@native-twin/css';
import * as Option from 'effect/Option';
import * as Data from 'effect/Data';
import type { MappedComponent } from '../../utils/constants';

export class TwinJSXStyledProp extends Data.Class<{
  text: string;
  expression: Option.Option<string>;
  twinRules: TWParsedRule[];
  prop: string;
  target: string;
}> {
  get hasExpression() {
    return Option.isSome(this.expression);
  }
}

/**
 * @domain Babel
 * @description Extract the {@link TwinJSXStyledProp} from any {@link t.JSXAttribute}
 * */
export const fromJSXAttribute = (
  attribute: t.JSXAttribute,
  config: MappedComponent,
): TwinJSXStyledProp | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  let ast: t.TemplateLiteral | t.StringLiteral | undefined = undefined;
  const [prop, target] = className;

  if (t.isStringLiteral(attribute.value)) {
    ast = attribute.value;
  }

  if (t.isJSXExpressionContainer(attribute.value)) {
    if (t.isTemplateLiteral(attribute.value.expression)) {
      ast = attribute.value.expression;
    }
    if (t.isCallExpression(attribute.value.expression)) {
      ast = t.templateLiteral(
        [
          t.templateElement({ raw: '', cooked: '' }),
          t.templateElement({ raw: '', cooked: '' }),
        ],
        [attribute.value.expression],
      );
    }
  }
  if (!ast) return null;

  const { templateExpression: expression, text, twinRules } = getPropValueString(ast);
  return new TwinJSXStyledProp({ expression, text, twinRules, prop, target });
};

const getPropValueString = Match.type<t.StringLiteral | t.TemplateLiteral>().pipe(
  Match.when(t.isStringLiteral, (x) => {
    const text = cx`${x.value}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.none<string>(),
    };
  }),
  Match.when(t.isTemplateLiteral, (template) => {
    const cooked = templateLiteralToStringLike(template);
    const text = cx`${cooked.strings}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.liftPredicate(
        template.expressions,
        (x) => x.length > 0,
      ).pipe(Option.map((x) => new CodeGenerator(cooked.expressions).generate().code)),
    };
  }),
  Match.exhaustive,
);

const templateLiteralToStringLike = (literal: t.TemplateLiteral) => {
  const strings = literal.quasis
    .map((x) => (x.value.cooked ? x.value.cooked : x.value.raw))
    .map((x) => x.trim().replace(/\n/g, '').trim().replace(/\s+/g, ' '))
    .filter((x) => x.length > 0)
    .join('');
  const expressions = t.templateLiteral(
    literal.quasis.map(() => t.templateElement({ raw: '', cooked: '' })),
    literal.expressions,
  );
  return { strings, expressions: expressions };
};
