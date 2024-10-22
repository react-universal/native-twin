import generate from '@babel/generator';
import * as t from '@babel/types';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Array from 'effect/Array';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Stream from 'effect/Stream';
import * as String from 'effect/String';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractMappedAttributes,
  templateLiteralToStringLike,
} from '@native-twin/babel/jsx-babel';
import { cx, RuntimeTW } from '@native-twin/core';
import {
  CompilerContext,
  compileSheetEntry,
  getGroupedEntries,
  RuntimeComponentEntry,
  sortSheetEntries,
} from '@native-twin/css/jsx';
import { JSXElementNode, ReactCompilerService } from '../../babel';
import { JSXMappedAttribute } from '../../babel/models/jsx.models';
import { extractSheetsFromTree } from '../../babel/utils/twin-jsx.utils';
import { MetroConfigService } from '../../metro';
import { DEFAULT_TWIN_INPUT_CSS_FILE, TWIN_DEFAULT_FILES } from '../../shared';

/**
 * Retrieves the path to the twin configuration file.
 *
 * This function checks if a provided `twinConfigPath` is a non-empty string. 
 * If it is, that path is returned. If not, it searches for default twin configuration files 
 * in the specified `rootDir`. The first existing file found will be returned.
 *
 * @param rootDir - The root directory where the twin configuration files are located.
 * @param twinConfigPath - An optional path to a specific twin configuration file. 
 * 
 * returns An `Option<string>` containing the resolved path to the twin configuration file, 
 * or None if no valid path is found.
 * 
 * @runtime `node`
 * 
 * @category `NativeTwin`
 *
 * @example
 ```ts
  const configPath = getTwinConfigPath('/path/to/root', 'customConfig.js');
  // Returns the path to 'customConfig.js' if it exists, otherwise checks for default files.
 ```
 *
 * @example ```ts
  const defaultConfigPath = getTwinConfigPath('/path/to/root');
  // Returns the path to the first existing default configuration file in the root directory.
  ```
 */
export const getTwinConfigPath = (rootDir: string, twinConfigPath = '') =>
  pipe(
    twinConfigPath,
    Option.liftPredicate(Predicate.compose(Predicate.isString, String.isNonEmpty)),
    Option.orElse(() =>
      pipe(
        TWIN_DEFAULT_FILES,
        Array.map((x) => path.join(rootDir, x)),
        Array.map((x) => Option.liftPredicate(x, fs.existsSync)),
        Option.firstSomeOf,
      ),
    ),
    Option.map((x) => path.resolve(x)),
  );

export const getTwinCacheDir = () =>
  path.join(path.dirname(require.resolve('@native-twin/core')), '.cache');

export const createTwinCSSFiles = ({
  outputDir,
  inputCSS,
}: {
  outputDir: string;
  inputCSS?: string;
}) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!inputCSS) {
    inputCSS = path.join(outputDir, DEFAULT_TWIN_INPUT_CSS_FILE);
    fs.writeFileSync(inputCSS, '');
  }

  // fs.writeFileSync(outputCSS, '.tt_root { font-size: 16px }', 'utf-8');
  return {
    inputCSS,
  };
};

export const getFileClasses = (filename: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(filename).pipe(
      Effect.mapError((x) => {
        console.log('getFileClasses_ERROR: ', x);
        return false;
      }),
    );
    const ctx = yield* MetroConfigService;
    const reactCompiler = yield* ReactCompilerService;

    if (!exists) {
      return {
        fileClasses: '',
        registry: HashMap.empty<string, JSXElementNode>(),
      };
    }

    const contents = yield* fs.readFileString(filename);

    if (contents === '') {
      return {
        fileClasses: '',
        registry: HashMap.empty<string, JSXElementNode>(),
      };
    }
    const filePath = path.relative(ctx.userConfig.projectRoot, filename);
    const babelTrees = yield* reactCompiler.getTrees(contents, filePath);

    const registry = yield* pipe(
      Stream.fromIterable(babelTrees),
      Stream.mapEffect((x) =>
        extractSheetsFromTree(x, path.relative(ctx.userConfig.projectRoot, filename)),
      ),
      Stream.map(HashMap.fromIterable),

      Stream.runFold(HashMap.empty<string, JSXElementNode>(), (prev, current) => {
        return pipe(prev, HashMap.union(current));
      }),
    );

    const fileClasses = pipe(
      babelTrees,
      RA.flatMap((x) => x.all()),
      RA.flatMap((leave) => extractMappedAttributes(leave.value.babelNode)),
      RA.map(({ value }) => {
        let classNames = '';
        if (t.isStringLiteral(value)) {
          classNames = value.value;
        } else {
          const cooked = templateLiteralToStringLike(value);
          classNames = cooked.strings.replace('\n', ' ');
        }
        return cx(`${classNames.trim()}`);
      }),
      RA.join(' '),
    );

    return { fileClasses, registry };
  }).pipe(Effect.scoped);

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
      if (t.isStringLiteral(value)) {
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
        classNames,
        prop,
        target,
        templateLiteral: templateExpression,
        entries: runtimeEntries,
        templateEntries: [],
        // childEntries: pipe(
        //   runtimeEntries,
        //   RA.filter((x) => isChildEntry(x)),
        // ),
        rawSheet: getGroupedEntries(runtimeEntries),
      };
    }),
  );
};
