/* eslint-disable no-console */
const production = process.argv[2] === '--production';
// const watch = process.argv[2] === '--watch';
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: [
      './src/extension.ts',
      {
        in: './src/client/index.ts',
        out: './client',
      },
      {
        in: './src/server/index.ts',
        out: './server',
      },
    ],
    bundle: true,
    platform: 'node',
    outdir: 'build',
    external: ['vscode'],
    format: 'cjs',
    logLevel: 'info',
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
