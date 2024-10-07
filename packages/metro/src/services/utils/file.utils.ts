import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
// import * as VSCDocument from 'vscode-languageserver-textdocument';
import {
  createBabelAST,
  extractMappedAttributes,
  getAstTrees,
  templateLiteralToStringLike,
} from '@native-twin/babel/jsx-babel';
import { cx } from '@native-twin/core';
// import { getDocumentLanguageLocations } from '@native-twin/language-service';
import * as t from '@babel/types';
import { PlatformError } from '@effect/platform/Error';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';

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

    // if (!fs.exists(currentPath)) {
    //   return [];
    // }

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

// const extractDocumentLanguageRegions = (
//   filename: string,
//   text: string,
//   attributes: string[],
// ) => {
//   const document = VSCDocument.TextDocument.create(filename, 'typescriptreact', 1, text);
//   const regions = getDocumentLanguageLocations(text, {
//     attributes,
//     tags: languageDefaultTags,
//   });

//   return pipe(
//     regions,
//     RA.map((x) =>
//       document.getText({
//         start: {
//           character: x.start.column,
//           line: x.start.line,
//         },
//         end: {
//           character: x.end.column,
//           line: x.end.line,
//         },
//       }),
//     ),
//   );
// };

// export const getFirstStyles = () =>
//   Effect.gen(function* () {
//     const { userConfig, twin } = yield* MetroConfigService;
//     const { allFiles } = yield* TwinFSService;
//     const fs = yield* FileSystem.FileSystem;

//     const mapped = yield* pipe(
//       allFiles,
//       RA.filter((x) => x !== ''),
//       RA.map((filename) =>
//         getFileClasses(filename).pipe(
//           Effect.map((contents) => ({
//             filename,
//             contents,
//           })),
//         ),
//       ),
//       Effect.allSuccesses,
//     );

//     pipe(
//       mapped,
//       RA.filter((x) => x.contents !== ''),
//       RA.forEach((x) => twin(`${x.contents}`)),
//     );
//     mapped.filter((x) => x.contents !== '');

//     yield* fs.writeFile(
//       userConfig.outputCSS,
//       new TextEncoder().encode(sheetEntriesToCss(twin.target, true)),
//     );
//   });

export const getFileClasses = (filename: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(filename);

    if (!exists) return '';

    const contents = yield* fs.readFileString(filename);

    if (contents === '') return '';
    const ast = createBabelAST(contents);
    const trees = yield* getAstTrees(ast, filename);

    return pipe(
      trees,
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
  });
