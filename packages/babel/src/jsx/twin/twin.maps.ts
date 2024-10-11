import template from '@babel/template';
import * as t from '@babel/types';
import CodeBlockWriter from 'code-block-writer';
import { RuntimeComponentEntry } from '@native-twin/css/jsx';
import { expressionFactory } from '../ast/writer.factory';

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
    return null;
  }
};
/*
export const entriesToComponentData = (id: string, entries: RuntimeComponentEntry[]) => {
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
*/

export const entriesToComponentData = (id: string, entries: RuntimeComponentEntry[]) => {
  const { writer, identifier } = expressionFactory(new CodeBlockWriter());

  const styledProp = writer
    .block(() => {
      // identifier(`require('@native-twin/jsx').StyleSheet.registerComponent("${id}", `);
      identifier(`globalStyles?.["${id}"]`);
    })
    .toString();

  return {
    styledProp,
    templateEntries: null,
  };
};

export const entriesToObject = (id: string, entries: RuntimeComponentEntry[]) => {
  const { writer, identifier, array } = expressionFactory(new CodeBlockWriter());

  const styledProp = writer
    .block(() => {
      // identifier(`require('@native-twin/jsx').StyleSheet.registerComponent("${id}", `);
      identifier(`StyleSheet.registerComponent("${id}", `);
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

  const templateEntries = entries.filter((x) => x.templateLiteral);
  // console.log('TEMPLATE_ENTRIES: ', templateEntries.length);
  if (templateEntries.length > 0) {
    const templateEntriesWriter = expressionFactory(new CodeBlockWriter());
    templateEntriesWriter.writer.block(() => {
      templateEntriesWriter.writer.write('[');
      templateEntries.forEach((x) => {
        if (x.templateLiteral) {
          templateEntriesWriter.writer.block(() => {
            templateEntriesWriter.writer.writeLine(`id: "${id}",`);
            templateEntriesWriter.writer.writeLine(`target: "${x.target}",`);
            templateEntriesWriter.writer.writeLine(`prop: "${x.prop}",`);
            templateEntriesWriter.writer.writeLine(
              `entries: require('@native-twin/core').tw(${x.templateLiteral}),`,
            );
            templateEntriesWriter.writer.write(`templateLiteral: ${x.templateLiteral},`);
          });
        }
      });
      templateEntriesWriter.writer.write(']');
    });
    return {
      styledProp,
      templateEntries: templateEntriesWriter.writer.toString(),
    };
  }
  return {
    styledProp,
    templateEntries: null,
  };
};
