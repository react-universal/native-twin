/* eslint-disable no-console */
const production = process.argv[2] === '--production';
const watch = process.argv[2] === '--watch';

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: 'build',
    external: ['vscode', '@universal-labs/twind-adapter', '@twind/core'],
    format: 'cjs',
    logLevel: 'info',
    platform: 'node',
    watch: !!watch,
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
