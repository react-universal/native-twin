import type { FilePath } from './Path.model';

export interface TwinFile {
  id: string;
  path: FilePath;
  code: string;
  dirname: string;
  basename: string;
}
