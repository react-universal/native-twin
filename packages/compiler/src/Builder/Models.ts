import * as Option from 'effect/Option';
import type { CompiledModule } from '../Compiler/Models';
import type { TwinPath } from '../internal/fs';

export class BuildProject {
  private _modules = new Map<TwinPath.FullFilePath, CompiledModule>();

  getModule(filename: TwinPath.FullFilePath) {
    return Option.fromNullable(this._modules.get(filename));
  }

  injectModule(filename: TwinPath.FullFilePath, module: CompiledModule) {
    this._modules.set(filename, module);
  }

  hasModule(filename: TwinPath.FullFilePath) {
    return this._modules.has(filename);
  }
}
