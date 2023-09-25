/* eslint-disable no-console */
const production = process.argv[2] === '--production';
const watch = process.argv[2] === '--watch';
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: {
      extension: './src/client/index.ts',
      server: './src/server/index.ts',
    },
    bundle: true,
    platform: 'node',
    outdir: 'build',
    external: ['vscode'],
    format: 'cjs',
    logLevel: 'info',
    watch: !!watch,
    sourcemap: 'external',
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
