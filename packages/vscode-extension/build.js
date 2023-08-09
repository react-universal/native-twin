/* eslint-disable no-console */
const production = process.argv[2] === '--production';
// const watch = process.argv[2] === '--watch';
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./client/src/extension.ts'],
    bundle: true,
    platform: 'node',
    outdir: './client/out',
    external: ['vscode'],
    format: 'cjs',
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

esbuild
  .build({
    entryPoints: ['./server/src/server.ts'],
    bundle: true,
    outdir: './server/out',
    platform: 'node',
    external: ['vscode'],
    format: 'cjs',
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
