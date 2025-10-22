import * as Data from 'effect/Data';
import { type FilePath, NodePath } from './Path.model';

export class TwinFile extends Data.Class<{
  path: FilePath;
  code: string;
}> {
  get dirname() {
    return NodePath.dirname(this.path);
  }
  get basename() {
    return NodePath.basename(this.path);
  }
}
