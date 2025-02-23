import { CodeGenerator } from '@babel/generator';
import * as _babelParser from '@babel/parser';
import type { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import { cx } from '@native-twin/core';
import { parseTWTokens } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Match from 'effect/Match';
import * as Option from 'effect/Option';
import type { MappedComponent } from '../utils/constants';
import type { JSXMappedAttribute } from './JSXModels';
import type { BabelFileAst, ImportSource } from './Models';
import {
  isCallExpression,
  isImportDeclaration,
  isImportSpecifier,
  isJSXAttribute,
  isVariableDeclaratorPath,
} from './Predicates';

export const isLocalImport = (path: string) =>
  path.startsWith('.') || path.startsWith('/');

/**
 * @domain Babel
 * @description Extract the {@link JSXMappedAttribute} from any {@link t.JSXAttribute}
 * */
export const extractStyledProp = (
  attribute: t.JSXAttribute,
  config: MappedComponent,
): JSXMappedAttribute | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  let ast: t.TemplateLiteral | t.StringLiteral | undefined = undefined;
  const prop = className[0];
  const target = className[1];

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

  const { templateExpression, text, twinRules } = getPropValueString(ast);
  return {
    value: {
      text,
      templateExpression,
      twinRules,
    },
    prop,
    target,
  };
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

/**
 * @domain Babel
 * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
 * */
export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  RA.filter(element.openingElement.attributes, isJSXAttribute);

export const getBabelBindingImportSource = (binding: Binding) =>
  Option.firstSomeOf([
    getBindingImportDeclaration(binding),
    getBindingRequireDeclaration(binding),
  ]);

const getBindingImportDeclaration = (binding: Binding) =>
  Option.liftPredicate(binding.path, isImportSpecifier).pipe(
    Option.bindTo('importSpecifier'),
    Option.bind('importDeclaration', ({ importSpecifier }) =>
      Option.liftPredicate(importSpecifier.parentPath, isImportDeclaration),
    ),
    Option.map(
      (source): ImportSource => ({
        kind: 'import',
        source: source.importDeclaration.node.source.value,
      }),
    ),
  );

const getBindingRequireDeclaration = (binding: Binding) =>
  Option.liftPredicate(binding.path, isVariableDeclaratorPath).pipe(
    Option.bindTo('importSpecifier'),
    Option.bind('requireExpression', ({ importSpecifier }) =>
      Option.fromNullable(importSpecifier.node.init).pipe(
        Option.flatMap((init) => Option.liftPredicate(init, isCallExpression)),
        Option.flatMap((x) => RA.head(x.arguments)),
        Option.flatMap((x) => Option.liftPredicate(x, t.isStringLiteral)),
      ),
    ),
    Option.map((source): ImportSource => {
      return {
        kind: 'require',
        source: source.requireExpression.value,
      };
    }),
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

const plugins: _babelParser.ParserPlugin[] = [
  'asyncGenerators',
  'classProperties',
  'dynamicImport',
  'functionBind',
  'jsx',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'decorators-legacy',
  'typescript',
  'optionalChaining',
  'nullishCoalescingOperator',
];

export const babelParserOptions: _babelParser.ParserOptions = {
  plugins,
  sourceType: 'module',
  errorRecovery: true,
};

const parser = _babelParser.parse.bind(_babelParser);

export function babelParse(code: string | Buffer, fileName?: string): BabelFileAst {
  const codeString = code.toString();
  try {
    return parser(codeString, babelParserOptions);
  } catch (err) {
    throw new Error(
      `Error parsing babel: ${err} in ${fileName}, code:\n${codeString}\n ${
        (err as any).stack
      }`,
    );
  }
}
