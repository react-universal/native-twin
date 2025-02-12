import type { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { Array, identity } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { FSUtils, TwinPath } from '../internal/fs';
import { TwinNodeContext } from '../services/TwinNodeContext.service';
import { TwinResolverContext } from '../services/TwinResolver.service';
import {
  funcJSXElementFunction,
  getBabelBindingImportSource,
} from '../utils/babel/babel.utils';

export const evaluateFile = (filename: string, content?: string) =>
  Effect.gen(function* () {
    const resolver = yield* TwinResolverContext;

    const result = yield* resolver.loadFile({ filename, content });

    return result;
  });

export const getJSXElementID = (ast: NodePath<t.JSXElement>) =>
  Effect.gen(function* () {
    const nameX = Option.liftPredicate(ast.node.openingElement.name, (x) =>
      t.isJSXIdentifier(x),
    );
    const importSource = nameX.pipe(
      Option.flatMap((x) => Option.fromNullable(ast.scope.getBinding(x.name))),
      Option.flatMap((binding) => getBabelBindingImportSource(binding)),
    );
    const declarator = Option.fromNullable(funcJSXElementFunction(ast));

    return { importSource, declarator };
  });

export const getScopeStaticBindings = (
  scope: NodePath<t.JSXElement>['scope'],
  sourcePath: string,
) =>
  Effect.gen(function* () {
    const ctx = yield* TwinNodeContext;
    const path = yield* TwinPath.TwinPath;
    const fs = yield* FSUtils.FsUtils;
    const program = scope.getProgramParent().block as t.Program;

    const dependenciesStream = yield* Stream.fromIterable(program.body).pipe(
      Stream.filterMap(Option.liftPredicate((node) => t.isImportDeclaration(node))),
      Stream.filter((node) => isLocalImport(node.source.value)),
      Stream.map((node) => resolveImportPath(sourcePath, node.source.value)),
      Stream.mapEffect((depPath) => fs.findFileExtension(depPath)),
      Stream.filterMap(identity),
      Stream.filterEffect((depPath) => ctx.isAllowedPath(depPath)),
      Stream.runCollect,
      Effect.map(Array.fromIterable),
    );

    return {
      filename: sourcePath,
      dependenciesStream,
    };

    function resolveImportPath(sourcePath: string, targetPath: string) {
      const sourceDir = path.dirname(sourcePath);
      if (isLocalImport(targetPath)) {
        if (path.extname(targetPath) === '') {
          targetPath += '';
        }
        console.log('LOCAL_TARGET_PATH : ', {
          sourceDir,
          targetPath,
          result: path.resolve(sourceDir, targetPath),
        });
        return path.resolve(sourceDir, targetPath);
      }

      return targetPath;
    }
  });

const isLocalImport = (path: string) => path.startsWith('.') || path.startsWith('/');
