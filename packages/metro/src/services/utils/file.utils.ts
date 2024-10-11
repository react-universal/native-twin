// import { getDocumentLanguageLocations } from '@native-twin/language-service';
import * as t from '@babel/types';
import type { PlatformError } from '@effect/platform/Error';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Stream from 'effect/Stream';
import path from 'path';
// import * as VSCDocument from 'vscode-languageserver-textdocument';
import {
  createBabelAST,
  extractMappedAttributes,
  extractSheetsFromTree,
  getAstTrees,
  templateLiteralToStringLike,
} from '@native-twin/babel/jsx-babel';
import { JSXElementNode } from '@native-twin/babel/models';
import { cx } from '@native-twin/core';
import { MetroConfigService } from '../MetroConfig.service';

// const languageDefaultTags = [
//   'tw',
//   'apply',
//   'css',
//   'variants',
//   'styled',
//   'tx',
//   'style',
//   'createVariants',
// ];

export function readDirectoryRecursive(
  currentPath: string,
): Effect.Effect<string[], PlatformError, FileSystem.FileSystem | Path.Path> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    if (path.extname(currentPath) !== '') {
      return [currentPath];
    }
    const directories = yield* pipe(
      fs.readDirectory(currentPath),
      Effect.map((baseNames) => {
        return pipe(
          baseNames,
          RA.map((name) => {
            return path.resolve(currentPath, name);
          }),
        );
      }),
    );

    const entriesDict: Record<string, FileSystem.File.Info> = yield* pipe(
      Effect.reduceEffect(
        directories.map((path) =>
          pipe(
            fs.stat(path),
            Effect.map((stat) => ({ [path]: stat })),
          ),
        ),
        Effect.succeed({}),
        (prev, item) => ({ ...prev, ...item }),
        { concurrency: 10 },
      ),
    );

    const recursiveListings = pipe(
      directories,
      RA.map((x) =>
        entriesDict[x]?.type === 'Directory'
          ? readDirectoryRecursive(x)
          : Effect.succeed([path.resolve(currentPath, x)]),
      ),
    );

    const entries = yield* pipe(
      Effect.allSuccesses(recursiveListings, { concurrency: 10 }),
      Effect.map(RA.flatten),
    );

    return entries;
  });
}

export const getFileClasses = (filename: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(filename);
    const ctx = yield* MetroConfigService;

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
    const ast = createBabelAST(contents);
    const babelTrees = yield* getAstTrees(
      ast,
      path.relative(ctx.userConfig.projectRoot, filename),
    );

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
  });
