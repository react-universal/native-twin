import { CodeGenerator } from '@babel/generator';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { cx } from '@native-twin/core';
import { type SheetEntry, parseTWTokens } from '@native-twin/css';
import { type CompilerContext, SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Match from 'effect/Match';
import * as Option from 'effect/Option';
import type { CompilerStyleSheet } from '../models/CompilerSheet';
import { JSXElementSheet } from '../models/CompilerStyleSheet';
import type { JSXMappedAttribute, TwinJSXElement } from '../models/JSXElement.model';
import type { MappedComponent } from '../shared/compiler.constants';
import { templateLiteralToStringLike } from '../utils/babel/babel.utils';

export const resolveDeclarator = (node: NodePath<t.Node>) => {
  let name = 'Unknown';
  let isExported = false;
  if (node.isArrowFunctionExpression()) {
    const parent = node.parentPath;
    if (parent.isVariableDeclarator()) {
      const ident = parent.node.id;
      if (t.isIdentifier(ident)) {
        name = ident.name;
      }

      const fnParent = parent.parentPath;
      isExported =
        fnParent.isExportDeclaration() || fnParent.isExportDefaultDeclaration();
      const upperParent = fnParent.parentPath;
      if (!isExported && upperParent) {
        isExported =
          upperParent.isExportDeclaration() || upperParent.isExportDefaultDeclaration();
      }
    }
    return { name, isExported };
  }

  if (node.isFunctionDeclaration() && node.node.id) {
    const fnParent = node.parentPath;
    isExported = fnParent.isExportDeclaration() || fnParent.isExportDefaultDeclaration();
    return { name: node.node.id.name, isExported };
  }

  return { name, isExported };
};

export const compileTwinElement = (
  element: TwinJSXElement,
  sheet: CompilerStyleSheet,
  parentSheet?: JSXElementSheet,
) => {
  const compiledProps = element.mappedProps.map((prop) => {
    const { childEntries, entries } = mapTwinEntriesToSheetHandler(
      sheet.twinFn(prop.value.text),
      sheet.ctx,
    );
    return {
      ...prop,
      entries,
      childEntries,
    };
  });
  return new JSXElementSheet(element, compiledProps, parentSheet);
};

export const mapTwinEntriesToSheetHandler = (entries: SheetEntry[], ctx: CompilerContext) => {
  const handlers = RA.partition(
    entries.map((x) => new SheetEntryHandler(x, ctx)),
    (x) => x.isChildEntry(),
  );
  return {
    entries: handlers[0],
    childEntries: handlers[1],
  };
};

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
