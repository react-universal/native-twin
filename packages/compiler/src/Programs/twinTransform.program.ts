import { CodeGenerator } from '@babel/generator';
import * as t from '@babel/types';
import { asArray } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type { TwinRunnerPlatform } from '../Config';
import type { TwinModuleAst } from '../Domain/TwinAst';
import { TwinProjectContext } from '../Project';
import { addJsxAttribute, templateLiteralsToInject } from '../utils/babel/babel.utils';

export const twinTransformProgram = Effect.fn(function* (
  twinModule: TwinModuleAst,
  platform: TwinRunnerPlatform,
) {
  const compiler = yield* TwinProjectContext;

  const runtimeStyles = yield* Stream.fromIterableEffect(
    compiler.compileAst(twinModule, platform),
  ).pipe(
    Stream.map((treeNode) => {
      const runtimeNode = treeNode.value.toRuntimeJSX();
      // treeNode.parent?.value.
      // const babelJsxElementStyles = literalValueToAst(runtimeNode);

      addJsxAttribute(
        treeNode.value.node.value.babelPath.node,
        '__twinID',
        treeNode.value.node.value.id,
      );
      addJsxAttribute(
        treeNode.value.node.value.babelPath.node,
        '__parentID',
        treeNode.value.parentID ?? 'NULL',
      );

      const templateProps = runtimeNode.props.flatMap((x) => {
        if (!x.templateEntries) return [];
        const ast = templateLiteralsToInject(x.templateEntries);
        if (!ast) return [];
        return asArray({ expression: ast, prop: x, target: x.target });
      });

      for (const prop of treeNode.value.node.value.classNameProps) {
        prop.compileAttribute();
      }

      if (templateProps.length > 0) {
        const attribute = t.jsxAttribute(
          t.jsxIdentifier('__twinExpressions'),
          t.jsxExpressionContainer(
            t.arrayExpression(
              templateProps.map((template) =>
                t.objectExpression([
                  t.objectProperty(t.identifier('prop'), t.stringLiteral(template.prop.prop)),
                  t.objectProperty(t.identifier('target'), t.stringLiteral(template.target)),
                  t.objectProperty(t.identifier('expression'), template.expression),
                ]),
              ),
            ),
          ),
        );
        treeNode.value.node.value.babelPath.node.openingElement.attributes.push(attribute);
      }

      // const registerNodeStore = babelTemplates.twinStoreRegisterJSX({
      //   TWIN_STORE_HANDLER_VAR: t.identifier(TWIN_STORE_IMPORT),
      //   JSX_NODE_SHEET: babelJsxElementStyles,
      // }) as t.Statement;
      // twinModule.addStyleRegistryExp(registerNodeStore);
      twinModule.registerComponent(runtimeNode);
      return runtimeNode;
    }),
    Stream.runCollect,
  );

  return {
    generated: new CodeGenerator(twinModule.ast).generate(),
    runtimeStyles: runtimeStyles,
  };
});
