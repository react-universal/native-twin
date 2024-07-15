import * as fs from 'fs';
import * as path from 'path';
import { TWIN_CACHE_DIR } from '../utils/constants';

export const cache = new Map<string, string>();

interface VirtualModuleArgs {
  rootDir: string;
  fileName: string;
}

export const resolveTwinPath = (rootDir: string, fileName: string) =>
  path.resolve(rootDir, TWIN_CACHE_DIR, fileName);

export function createVirtualModule(data: VirtualModuleArgs) {
  const virtualPath = resolveTwinPath(data.rootDir, data.fileName);

  fs.mkdirSync(path.dirname(virtualPath), { recursive: true });

  return { path };
}
