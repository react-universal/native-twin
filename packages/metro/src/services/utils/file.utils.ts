import { FileSystem, Path } from '@effect/platform';
import { PlatformError } from '@effect/platform/Error';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import { getDocumentLanguageLocations } from '@native-twin/language-service';

const languageDefaultTags = [
  'tw',
  'apply',
  'css',
  'variants',
  'styled',
  'tx',
  'style',
  'createVariants',
];

export function readDirectoryRecursive(
  currentPath: string,
): Effect.Effect<string[], PlatformError, FileSystem.FileSystem | Path.Path> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    if (fs.exists(currentPath)) {
      return [];
    }

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
      Effect.all(recursiveListings, { concurrency: 10 }),
      Effect.map(RA.flatten),
    );

    return entries;
  }).pipe(
    Effect.catchAllCause((x) => {
      console.log('ERROR: ', x.toJSON());
      return Effect.succeed([]);
    }),
  );
}

export const extractDocumentLanguageRegions = (
  filename: string,
  text: string,
  attributes: string[],
) => {
  const document = VSCDocument.TextDocument.create(filename, 'typescriptreact', 1, text);
  const regions = getDocumentLanguageLocations(text, {
    attributes,
    tags: languageDefaultTags,
  });

  return pipe(
    regions,
    RA.map((x) =>
      document.getText({
        start: {
          character: x.start.column,
          line: x.start.line,
        },
        end: {
          character: x.end.column,
          line: x.end.line,
        },
      }),
    ),
  );
};
