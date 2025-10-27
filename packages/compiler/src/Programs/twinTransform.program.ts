import { CodeGenerator } from '@babel/generator';
import * as t from '@babel/types';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import { babelTemplates } from '../Babel';
import type { TwinRunnerPlatform } from '../Config';
import { TWIN_STORE_IMPORT, type TwinModuleAst } from '../Domain/TwinAst';
import { TwinProjectContext } from '../Project';
import { addJsxAttribute, literalValueToAst } from '../utils/babel/babel.utils';

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
      const babelJsxElementStyles = literalValueToAst(runtimeNode);

      addJsxAttribute(treeNode.value.node.babelPath.node, '__twinID', treeNode.value.node.id);
      addJsxAttribute(
        treeNode.value.node.babelPath.node,
        '__parentID',
        treeNode.value.parentID ?? 'NULL',
      );

      const registerNodeStore = babelTemplates.twinStoreRegisterJSX({
        TWIN_STORE_HANDLER_VAR: t.identifier(TWIN_STORE_IMPORT),
        JSX_NODE_SHEET: babelJsxElementStyles,
      }) as t.Statement;
      twinModule.addStyleRegistryExp(registerNodeStore);
      return runtimeNode;
    }),
    Stream.runCollect,
  );

  return {
    generated: new CodeGenerator(twinModule.ast).generate(),
    runtimeStyles: runtimeStyles,
  };
});
