import { CodeGenerator } from '@babel/generator';
import * as t from '@babel/types';
import { cx } from '@native-twin/core';
import { parseTWTokens } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { JSXAttributeNode, JSXElementPath } from '../Babel';
import type { TwinFile } from '../FileSystem';
import { type MappedComponent, mappedComponents } from '../utils/constants';
import { TwinJSXClassnameProp } from './JSXStyledProp';
import type { ModuleDependency } from './TwinBabelModule';

export class TwinJSXElementNode implements Equal.Equal {
  readonly mappedProps: MappedComponent;
  readonly classNameProps: TwinJSXClassnameProp[];

  get id() {
    return `__JSXElementNode:${this[Hash.symbol]()}:${this.name}`;
  }
  get hasExpressions() {
    return this.classNameProps.some((x) => x.hasExpression);
  }
  constructor(
    readonly file: TwinFile,
    readonly babelPath: JSXElementPath,
    readonly name: string,
    readonly dependency: Option.Option<ModuleDependency>,
  ) {
    this.mappedProps = RA.findFirst(mappedComponents, (x) => x.name === this.name).pipe(
      Option.getOrElse(
        (): MappedComponent => ({ name: this.name, config: {}, kind: 'unknown' }),
      ),
    );
    this.classNameProps = getClassNamePropsFromJSX(babelPath, this.mappedProps);
  }

  [Hash.symbol](): number {
    return Hash.structure({
      loc: this.babelPath.node.loc,
      range: [this.babelPath.node.start, this.babelPath.node.end],
    });
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TwinJSXElementNode && this[Hash.symbol]() === that[Hash.symbol]()
    );
  }
}

const getClassNamePropsFromJSX = (
  jsxElement: JSXElementPath,
  mappedConfig: MappedComponent,
) => {
  const classNameProps: TwinJSXClassnameProp[] = [];
  const jsxAttributes = jsxElement
    .get('openingElement')
    .get('attributes')
    .filter((x) => x.isJSXAttribute());

  const validClassNames = Object.entries(mappedConfig.config);
  for (const attribute of jsxAttributes) {
    const namePath = attribute.get('name');
    if (!namePath.isJSXIdentifier()) continue;

    const className = validClassNames.find((x) => attribute.node.name.name === x[0]);
    if (!className) continue;

    const [prop, target] = className;
    const ast = getJSXAttributeValue(attribute.node);
    if (!ast) continue;

    const value = getPropValueString(ast);
    classNameProps.push(
      new TwinJSXClassnameProp({
        prop,
        target,
        ast: attribute,
        expression: value.templateExpression,
        text: value.text,
        twinRules: value.twinRules,
      }),
    );
  }

  return classNameProps;
};

/**
 * @domain Babel
 * @description Extract the {@link TwinJSXClassnameProp} from any {@link t.JSXAttribute}
 * */
const getJSXAttributeValue = (attribute: JSXAttributeNode) => {
  if (!t.isJSXIdentifier(attribute.name)) return null;

  let ast: t.TemplateLiteral | t.StringLiteral | undefined = undefined;

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

  return ast;
};

const getPropValueString = (node: t.StringLiteral | t.TemplateLiteral) => {
  if (t.isStringLiteral(node)) {
    const text = cx`${node.value}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.none<string>(),
    };
  }
  const cooked = templateLiteralToStringLike(node);
  const text = cx`${cooked.strings}`;
  return {
    text,
    twinRules: parseTWTokens(text),
    templateExpression: Option.liftPredicate(node.expressions, (x) => x.length > 0).pipe(
      Option.map((x) => new CodeGenerator(cooked.expressions).generate().code),
    ),
  };
};

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
