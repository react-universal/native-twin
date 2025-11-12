import * as Glob from 'glob';
import * as Fs from 'node:fs';
import path from 'node:path';
import { inspect } from 'node:util';

const dirs = ['.', ...Glob.sync('packages/*/'), ...Glob.sync('packages/dev-tools/*/')];
const debug = !!process.argv[1];
const filesToDelete = dirs.flatMap((pkg) => {
  const files = [
    '.tsbuildinfo',
    'docs',
    'build',
    'dist',
    '.turbo',
    '.expo',
    '.rollup.cache'
  ];

  return files.flatMap((file) => {
    if (pkg === '.' && file === 'docs') return [];
    const toDelete = path.join(pkg, file);
    if (!Fs.existsSync(toDelete)) {
      if (debug) console.warn('NOT_EXISTS: ', toDelete);
      return [];
    }
    return [toDelete];
  });
});

console.log('FILES_TO_DELETE: ');
console.debug(inspect(filesToDelete, false, null, true));

filesToDelete.forEach((x) => Fs.rmSync(x, { recursive: true, force: true }));
