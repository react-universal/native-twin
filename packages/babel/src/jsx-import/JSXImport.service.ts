import { SheetEntry } from '@native-twin/css';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import micromatch from 'micromatch';
import path from 'node:path';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import {
  maybeBinding,
  maybeCreateElementExpression,
  maybeImportDeclaration,
  maybeReactIdent,
} from '../babel';
import { getUserTwinConfig, setupNativeTwin } from '../jsx/twin';
import { JSXElementNode, JSXElementNodeKey } from '../models/JSXElement.model';
import { TwinBabelOptions } from '../types/plugin.types';
import {
  isReactImport,
  isReactRequireBinding,
  maybeBindingIsReactImport,
} from './import.utils';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export class JSXImportPluginContext extends Context.Tag('babel/plugin/context')<
  JSXImportPluginContext,
  {
    rootPath: string;
    options: TwinBabelOptions;
    twin: RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
    allowedPaths: string[];
    twCtx: CompilerContext;
    isValidFile: (filename?: string) => boolean;
  }
>() {
  static make = (options: TwinBabelOptions, rootPath: string) =>
    Layer.scoped(
      JSXImportPluginContext,
      Effect.gen(function* () {
        const twConfig = getUserTwinConfig(rootPath, options);
        const twin = setupNativeTwin(twConfig, options);
        const allowedPaths = twConfig.content.map((x) =>
          path.resolve(rootPath, path.join(x)),
        );
        const twCtx: CompilerContext = {
          baseRem: twin.config.root.rem,
          platform: options.platform,
        };

        const visitedElements = HashMap.empty<JSXElementNodeKey, JSXElementNode>();

        return {
          options,
          rootPath,
          twin,
          twConfig: twin.config,
          allowedPaths,
          twCtx,
          visitedElements,
          isValidFile(filename = '') {
            const allowedFileRegex =
              /^(?!.*[/\\](react|react-native|react-native-web|@native-twin\/*)[/\\]).*$/;
            if (!micromatch.isMatch(filename, allowedPaths)) {
              return false;
            }
            return allowedFileRegex.test(filename);
          },
        };
      }),
    );
}

export class BabelJSXImportPlugin extends Context.Tag('babel/plugin/import-service')<
  BabelJSXImportPlugin,
  {
    memberExpressionIsReactImport: (path: NodePath<t.MemberExpression>) => boolean;
    identifierIsReactImport: (path: NodePath<t.Identifier>) => boolean;
  }
>() {
  static Live = Layer.scoped(
    BabelJSXImportPlugin,
    Effect.gen(function* () {
      return {
        memberExpressionIsReactImport: (path) => {
          return maybeCreateElementExpression(path)
            .pipe(maybeReactIdent, (x) => maybeBinding(x, path))
            .pipe(
              (x) => [maybeBindingIsReactImport(x), maybeImportDeclaration(x)] as const,
              Option.firstSomeOf,
              Option.getOrElse(() => false),
            );
        },
        identifierIsReactImport: (path) => {
          if (path.node.name === 'createElement' && path.parentPath.isCallExpression()) {
            return pipe(
              Option.fromNullable(path.scope.getBinding(path.node.name)),
              Option.map((x) => isReactRequireBinding(x) || isReactImport(x)),
              Option.getOrElse(() => false),
            );
          }
          return false;
        },
      };
    }),
  );
}
