/* eslint-disable no-console */
const production = process.argv[2] === '--production';

require('esbuild')
  .build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outdir: 'build',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    sourcemap: 'external',
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
