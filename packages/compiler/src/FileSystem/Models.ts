import * as Data from 'effect/Data';
import * as TwinPath from './Path.model';

export class TwinFile extends Data.Class<{
  path: TwinPath.FilePath;
  code: string;
}> {
  get dirname() {
    return TwinPath.NodePath.dirname(this.path);
  }
  get basename() {
    return TwinPath.NodePath.basename(this.path);
  }
}
