/* eslint-disable no-console */
const production = process.argv[2] === '--production';
// const watch = process.argv[2] === '--watch';

require('esbuild')
  .build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outdir: 'build',
    external: ['vscode'],
    format: 'cjs',
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
