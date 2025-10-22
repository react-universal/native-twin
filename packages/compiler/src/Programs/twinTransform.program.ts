import { CodeGenerator } from '@babel/generator';
import * as t from '@babel/types';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import { babelTemplates } from '../Babel';
import type { TwinRunnerPlatform } from '../Config';
import { TWIN_STYLESHEET_IMPORT, type TwinModuleAst } from '../Domain/TwinAst';
import { TwinProjectContext } from '../Project';
import { addJsxExpressionAttribute, literalValueToAst } from '../utils/babel/babel.utils';

export const twinTransformProgram = Effect.fn(function* (
  twinModule: TwinModuleAst,
  platform: TwinRunnerPlatform,
) {
  const compiler = yield* TwinProjectContext;

  yield* Stream.fromIterableEffect(compiler.compileAst(twinModule, platform)).pipe(
    Stream.tap((treeNode) => {
      return Effect.sync(() => {
        const runtimeNode = treeNode.value.toRuntimeJSX();
        const babelJsxElementStyles = literalValueToAst(runtimeNode);
        const babelStyledProp = babelTemplates.styledPropCall({
          STYLESHEET_VAR_NAME: t.identifier(TWIN_STYLESHEET_IMPORT),
          ELEMENT_KEY: t.stringLiteral(treeNode.value.node.id),
        });
        for (const prop of runtimeNode.props) {
          addJsxExpressionAttribute(
            treeNode.value.node.babelPath.node,
            prop.target,
            babelStyledProp,
          );
        }
        const registerJSXNodeAST = babelTemplates.styleSheetRegisterJSX({
          STYLESHEET_VAR_NAME: TWIN_STYLESHEET_IMPORT,
          JSX_NODE_SHEET: babelJsxElementStyles,
        }) as t.Statement;
        twinModule.addStyleRegistryExp(registerJSXNodeAST);
      });
    }),
    Stream.runDrain,
  );

  return new CodeGenerator(twinModule.ast).generate();

  // yield* Stream.fromIterableEffect(compiler.compileAst(twinModule, platform)).pipe(
  //   Stream.flatMap((node) => node.value.evaluatedStyledProps()),
  //   Stream.map((evaluated) => {
  //     const jsxElementKey = `${evaluated.node.id}_${evaluated.prop?.target ?? 'inject'}`;
  //     const babelJsxElementStyles = literalValueToAst(evaluated.styles);
  //     twinModule.appendToStyleObject(
  //       t.objectProperty(t.stringLiteral(jsxElementKey), babelJsxElementStyles),
  //     );
  //     const styledProp = babelTemplates.styledPropCall({
  //       STYLE_OBJECT: t.identifier(TWIN_MODULE_STYLES_OBJECT_VAR_NAME),
  //       ELEMENT_KEY: t.stringLiteral(jsxElementKey),
  //     });

  //     addJsxExpressionAttribute(
  //       evaluated.node.babelPath.node,
  //       evaluated.prop?.target ?? 'inject',
  //       styledProp,
  //     );
  //     const registerJSXNodeAST = babelTemplates.styleSheetRegisterJSX({
  //       STYLESHEET_VAR_NAME: TWIN_STYLESHEET_IMPORT,
  //       JSX_NODE_SHEET: babelJsxElementStyles,
  //     }) as t.Statement;
  //     twinModule.addStyleRegistryExp(registerJSXNodeAST);
  //     return {
  //       jsxElementKey,
  //       babelJsxElementStyles,
  //     };
  //   }),
  //   Stream.runDrain,
  // );
});
