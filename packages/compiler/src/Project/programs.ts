import * as Effect from 'effect/Effect';
import { identity } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Ref from 'effect/Ref';
import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';
import * as TwinPath from '../FileSystem/Path.model';
import { CompilerConfigContext } from '../services/CompilerConfig.service';
import { TwinNodeContext } from '../services/TwinNodeContext.service';
import type * as Models from './Models';
import { TwinProjectContext } from './Service';

export const createProjectRunner = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const env = yield* CompilerConfigContext;
  const project = yield* TwinProjectContext;
  const projectSheet = yield* Ref.make(new TwinProjectStyleSheet());

  const getProjectModules = Stream.fromIterableEffect(ctx.state.projectFiles.get).pipe(
    Stream.map((path_) => TwinPath.filePathFromString(path_, env.projectRoot)),
    Stream.mapEffect(project.moduleFromFilePath),
    Stream.run(Sink.collectAllToMap((module) => module.filepath, identity)),
  );

  return {
    getProjectModules,
    projectSheet,
    getModuleSheet,
  };

  function getModuleSheet(module: Models.ProjectModule) {
    return Effect.gen(function* () {
      yield* module.definitions.pipe(
        Stream.map((declaration) => declaration.rootJSXElement),
        Stream.runDrain,
      );
    });
  }
});

class TwinProjectStyleSheet {
  readonly sheet = new Map<TwinPath.FilePath, TwinModuleSheet>();
}

class TwinModuleSheet {
  readonly _moduleSheet = new Map<string, any>();
  get sheetID() {
    return `${this.parser.name}:${Hash.string(this.parser.filepath)}`;
  }
  constructor(readonly parser: Models.ProjectModule) {}
}
