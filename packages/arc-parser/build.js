/* eslint-disable no-console */
const production = process.argv[2] === '--production';
const watch = process.argv[2] === '--watch';

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: 'build',
    format: 'cjs',
    logLevel: 'info',
    platform: 'neutral',
    keepNames: true,
    watch: !!watch,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
