import * as Ansi from '@effect/printer-ansi/Ansi';
import * as Doc from '@effect/printer-ansi/AnsiDoc';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import { gzipSizeSync } from 'gzip-size';
import type * as rollup from 'rollup';

export const formatBytes = (bytes: number | string) => {
  if (typeof bytes === 'string' || bytes === 0) return '0 Byte';
  const k = 1024;
  const dm = 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// const sizeOrCodeSize = (size: number, code: string) => {
//   if (size || size === 0) return size;
//   return code ? Buffer.byteLength(code, 'utf8') : 0;
// };

export const outputBundleIsChunk = (
  x: rollup.OutputAsset | rollup.OutputChunk,
): x is rollup.OutputChunk => x.type === 'chunk';

export const maybeOutputChunk = (source: rollup.OutputAsset | rollup.OutputChunk) =>
  Option.liftPredicate(source, outputBundleIsChunk);

export const getBundleModules = (bundle: rollup.OutputBundle): rollup.OutputChunk[] =>
  pipe(
    Record.values(bundle),
    RA.filterMap((x) => maybeOutputChunk(x)),
  );

interface PluginResult {
  chunk: rollup.OutputChunk;
  filename: string;
  data: {
    /** @description in bytes */
    originalSize: number;
    /** @description in bytes */
    buildSize: number;
    sourceExports: string[];
    removedExports: string[];
    gzipSize: number;
  };
}
export const serializeOutputChunks = (chunks: rollup.OutputChunk[]): PluginResult[] => {
  return pipe(
    chunks,
    RA.bindTo('chunk'),
    RA.let('filename', (x) => x.chunk.fileName),
    RA.bind('data', (x) => {
      return pipe(
        Record.values(x.chunk.modules),
        RA.map((module) => ({
          originalSize: module.originalLength,
          buildSize: module.renderedLength,
          sourceExports: module.renderedExports,
          removedExports: module.removedExports,
          gzipSize: gzipSizeSync(module.code ?? ''),
        })),
      );
    }),
  );
};

const render = (doc: Doc.AnsiDoc): string =>
  Doc.render(doc, { style: 'pretty', options: { lineWidth: 80 } });
// type Signature<A> = [name: Doc.Doc<A>, type: Doc.Doc<A>];

const dashes = Doc.text(Array.from({ length: 32 - 2 }, () => '-').join(''));

const hr = Doc.hcat([Doc.vbar, dashes, Doc.vbar]);
const keyValuePair = <A>(first: Doc.Doc<A>, sec: Doc.Doc<A>) => {
  return Doc.hsep([Doc.fillBreak(first, 15), Doc.text('::'), sec]);
};

export const serializeBuildResult = (results: PluginResult[]) => {
  return pipe(
    results,
    RA.reduce(
      {
        outputSize: 0,
        modules: 0,
        originalSize: 0,
        gzipSize: 0,
      },
      (prev, current) => {
        prev.outputSize += current.data.buildSize;
        prev.originalSize += current.data.originalSize;
        prev.gzipSize += current.data.gzipSize;
        prev.modules++;
        return prev;
      },
    ),
    (x) => {
      const getValue = (data: string) => Doc.text(data).pipe(Doc.annotate(Ansi.green));

      const doc = Doc.vcat([
        hr,
        Doc.indent(
          Doc.align(
            Doc.vsep([
              keyValuePair(Doc.text('Output size'), getValue(formatBytes(x.outputSize))),
              keyValuePair(Doc.text('Modules'), getValue(String(x.modules))),
              keyValuePair(
                Doc.text('Original size'),
                getValue(formatBytes(x.originalSize)),
              ),
              keyValuePair(Doc.text('Gzip size'), getValue(formatBytes(x.gzipSize))),
              keyValuePair(
                Doc.text('Strip exports'),
                getValue(
                  String(RA.flatMap(results, (x) => x.data.removedExports).length),
                ),
              ),
            ]),
          ),
          2,
        ),
        hr,
      ]);

      return render(doc);
    },
  );
};

// export const rollupAnalyzerPlugin = (): rollup.OutputPlugin => {
//   return {
//     name: 'rollup-build-analyzer',
//     generateBundle: function (_, bundle) {
//       pipe(
//         getBundleModules(bundle),
//         serializeOutputChunks,
//         serializeBuildResult,
//         (module) => console.log(inspect(module, false, null, true)),
//       );
//     },
//   };
// };
