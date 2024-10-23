import { sheetEntriesToCss } from '@native-twin/css';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';
import CodeBlockWriter from 'code-block-writer';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import {
  entriesToObject,
  getJSXCompiledTreeRuntime,
  runtimeEntriesToAst,
} from '@native-twin/babel/jsx-babel';
import { getRawSheet } from '@native-twin/css/jsx';
import { JSXElementNode } from '../../babel/models';
import { MetroConfigService } from '../../metro';
import { getFileClasses, NativeTwinServiceNode } from '../native-twin';
import { readDirectoryRecursive } from '../utils';

const initialized: Set<string> = new Set();

const buildWatcher = Effect.gen(function* () {
  const twin = yield* NativeTwinServiceNode;
  const ctx = yield* MetroConfigService;
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const getAllFilesInProject = Effect.gen(function* () {
    const { allowedPaths } = yield* NativeTwinServiceNode;

    return yield* pipe(
      allowedPaths,
      RA.map(readDirectoryRecursive),
      Effect.allSuccesses,
    ).pipe(Effect.map((x) => pipe(x, RA.flatten, RA.dedupe)));
  });

  const getTwinCssOutput = (params: {
    filepath: string;
    platform: string;
    trees: HashMap.HashMap<string, JSXElementNode>[];
  }) => {
    return Effect.gen(function* () {
      console.log('[getTwinCssOutput]: ', params.filepath);

      if (params.filepath.endsWith('.css')) {
        return sheetEntriesToCss(twin.sheetTarget, false);
      } else {
        const registry = yield* createCompilerRegistry(params.trees);
        const jsOutput = pipe(
          HashMap.values(registry),
          RA.fromIterable,
          RA.map((node) => {
            const { leave } = getJSXCompiledTreeRuntime(
              node,
              pipe(
                node.parentID,
                Option.flatMap((x) => HashMap.get(registry, x)),
              ),
            );
            const stringEntries = entriesToObject(node.id, getRawSheet(leave.entries));
            const astProps = runtimeEntriesToAst(stringEntries.styledProp);
            return {
              stringEntries,
              astProps,
              node,
            };
          }),
          RA.map((x) => {
            const writer = new CodeBlockWriter();
            writer.newLine().indent(1).write(`['${x.node.id}']: `);
            return writer
              .indent(2)
              .block(() => {
                writer.writeLine(`_twinComponentID: '${x.node.id}',`);
                writer.writeLine(`_twinOrd: ${x.node.order},`);
                writer.writeLine(
                  `_twinComponentSheet: ${x.stringEntries.styledProp.slice(1, -1)}`,
                );
              })
              .toString();
          }),
          (x) => {
            const writer = new CodeBlockWriter();
            return writer
              .write(`export const globalSheets = `)
              .block(() => {
                writer.writeLine(`${x.join()}`);
              })
              .toString();
          },
          (stringStyles) => {
            const writer = new CodeBlockWriter();

            writer.write(`const StyleSheet = require('@native-twin/jsx').StyleSheet;`);
            writer.writeLine(`const setup = require('@native-twin/core').setup;`);
            writer.newLine();
            const { twinConfigPath } = ctx.userConfig;
            let importTwinPath = path.relative(
              path.dirname(twin.getPlatformOutput(params.platform)),
              twinConfigPath,
            );
            if (!importTwinPath.startsWith('.')) {
              importTwinPath = `./${importTwinPath}`;
            }
            writer.writeLine(`const twinConfig = require('${importTwinPath}');`);

            writer.writeLine(`setup(twinConfig);`);
            writer.write(stringStyles);
            // writer.write(stringStyles.replaceAll("require('@native-twin/jsx').", ''));
            return writer.toString();
          },
        );

        return jsOutput;
      }
    });
  };

  const refreshCSSOutput = (params: {
    filepath: string;
    platform: string;
    trees: HashMap.HashMap<string, JSXElementNode>[];
  }) => {
    return Effect.gen(function* () {
      const jsOutput = yield* getTwinCssOutput(params);
      const output = new TextEncoder().encode(jsOutput);
      console.log('CSS_OUTPUT: ', params.filepath);
      yield* fs.writeFile(params.filepath, output);
    });
  };

  const compileFiles = (files: string[]) => {
    return Effect.gen(function* () {
      const classes = yield* pipe(
        files,
        RA.map((x) => getFileClasses(x)),
        Effect.allSuccesses,
      );
      return RA.map(classes, (x) => {
        const twinOutput = twin.tw(`${x}`);
        return {
          twinOutput,
          trees: x.registry,
        };
      });
    });
  };

  const runTwinForFiles = (files: string[], platform: string) => {
    return Effect.gen(function* () {
      yield* Effect.log('Building project...');

      const twinResult = yield* compileFiles(files);
      yield* refreshCSSOutput({
        filepath: twin.getPlatformOutput(platform),
        trees: RA.map(twinResult, (x) => x.trees),
        platform,
      });
      yield* Effect.log(`Build success!`);
      yield* Effect.log(`Added ${twin.sheetTarget.length} classes`);
    });
  };

  const setupPlatform = (params: { targetPlatform: string; projectRoot: string }) =>
    Effect.gen(function* () {
      const allFiles = yield* getAllFilesInProject;
      const platform = params.targetPlatform ?? 'native';

      const hasPlatform = initialized.has(platform);
      const currentSize = initialized.size;
      if (!hasPlatform) {
        initialized.add(platform);
        if (currentSize === 0) {
          yield* Effect.log(`Initializing project \n`);
        }
        yield* runTwinForFiles(allFiles, platform);
        if (currentSize === 0) {
          yield* startWatcher.pipe(Effect.forkDaemon);
          yield* Effect.yieldNow();
          yield* Effect.log(`Watcher started`);
        }
      }
    });

  const startWatcher = Effect.gen(function* () {
    const path = yield* Path.Path;
    const allFiles = yield* getAllFilesInProject;
    // const platform = 'web';

    const watchFiles = pipe(
      allFiles,
      RA.map((x) => path.dirname(x)),
      RA.dedupe,
    );

    const allWatchers = yield* Effect.all(RA.map(watchFiles, createWatcherFor));

    return pipe(
      allWatchers,
      Stream.mergeAll({
        concurrency: watchFiles.length,
      }),
    );
  });

  const createWatcherFor = (basePath: string) => {
    return Effect.gen(function* () {
      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;

      return pipe(
        fs.watch(basePath),
        Stream.map((watchEvent) => ({
          ...watchEvent,
          path: path.resolve(basePath, watchEvent.path),
        })),
        Stream.filter((watchEvent) => twin.isAllowedPath(watchEvent.path)),
        Stream.tap((x) => Effect.log(`File change detected: ${x.path} \n`)),
      );
    });
  };

  return {
    startWatcher,
    setupPlatform,
    getAllFilesInProject,
    runTwinForFiles,
    getTwinCssOutput,
  };
});

const createCompilerRegistry = (trees: HashMap.HashMap<string, JSXElementNode>[]) =>
  pipe(
    Stream.fromIterable(trees),
    Stream.runFold(HashMap.empty<string, JSXElementNode>(), (prev, current) => {
      return pipe(prev, HashMap.union(current));
    }),
  );

export class TwinWatcherService extends Context.Tag('metro/files/watcher')<
  TwinWatcherService,
  Effect.Effect.Success<typeof buildWatcher>
>() {}

const rawLayer = Layer.scoped(TwinWatcherService, buildWatcher);

const FSLive = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, Path.layer);

export const twinFileSystemLayer = rawLayer.pipe(Layer.provideMerge(FSLive));
