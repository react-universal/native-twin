import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import CodeBlockWriter from 'code-block-writer';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { RuntimeTW } from '@native-twin/core';
import {
  CompilerContext,
  compileSheetEntry,
  getGroupedEntries,
  isChildEntry,
  RuntimeComponentEntry,
  sortSheetEntries,
} from '@native-twin/css/build/jsx';
import { templateLiteralToStringLike } from '../babel';
import { JSXMappedAttribute } from './jsx.types';
import { expressionFactory } from './writer.factory';

export const getElementEntries = (
  props: JSXMappedAttribute[],
  twin: RuntimeTW,
  ctx: CompilerContext,
): RuntimeComponentEntry[] => {
  return pipe(
    props,
    RA.map(({ value, prop, target }): RuntimeComponentEntry => {
      let classNames = '';
      let templateExpression: null | string = null;
      if (value.type === 'StringLiteral') {
        classNames = value.value;
      } else {
        const cooked = templateLiteralToStringLike(value);
        classNames = cooked.strings;
        templateExpression = generate(cooked.expressions).code;
      }

      const entries = twin(classNames);
      const runtimeEntries = pipe(
        entries,
        RA.dedupeWith((a, b) => a.className === b.className),

        RA.map((x) => compileSheetEntry(x, ctx)),
        sortSheetEntries,
      );

      return {
        prop,
        target,
        templateLiteral: templateExpression,
        entries: runtimeEntries,
        childEntries: pipe(
          runtimeEntries,
          RA.filter((x) => isChildEntry(x)),
        ),
        rawSheet: getGroupedEntries(runtimeEntries),
      };
    }),
  );
};

export const runtimeEntriesToAst = (entries: string) => {
  const ast = template.ast(entries);
  try {
    let value: t.Expression | undefined;
    if (Array.isArray(ast)) return;

    if (t.isExpressionStatement(ast)) {
      value = ast.expression;
    }

    if (t.isBlockStatement(ast)) {
      const firstBlock = ast.body[0];
      if (t.isExpression(firstBlock)) {
        value = firstBlock;
      }
      if (t.isExpressionStatement(firstBlock)) {
        value = firstBlock.expression;
      }
    }

    if (!value) {
      return null;
    }
    return value;
  } catch {
    console.log('ASD', ast);
    return null;
  }
};

export const entriesToObject = (id: string, entries: RuntimeComponentEntry[]) => {
  const { writer, identifier, array } = expressionFactory(new CodeBlockWriter());
  const templateEntries = expressionFactory(new CodeBlockWriter());
  templateEntries.writer.block(() => {
    templateEntries.writer.write('[');
    entries
      .filter((x) => x.templateLiteral)
      .forEach((x) => {
        if (x.templateLiteral) {
          templateEntries.writer.block(() => {
            templateEntries.writer.writeLine(`id: "${id}",`);
            templateEntries.writer.writeLine(`target: "${x.target}",`);
            templateEntries.writer.writeLine(`prop: "${x.prop}",`);
            templateEntries.writer.writeLine(
              `entries: require('@native-twin/core').tw(${x.templateLiteral}),`,
            );
            templateEntries.writer.write(`templateLiteral: ${x.templateLiteral},`);
          });
        }
      });
    templateEntries.writer.write(']');
  });
  const styledProp = writer
    .block(() => {
      identifier(`require('@native-twin/jsx').StyleSheet.registerComponent("${id}", `);
      array(
        entries.map((x) => {
          return {
            templateLiteral: null,
            prop: x.prop,
            target: x.target,
            entries: x.entries,
            rawSheet: x.rawSheet,
          };
        }),
      );
      identifier(`)`);
    })
    .toString();
  return {
    styledProp,
    templateEntries: templateEntries.writer.toString(),
  };
};
