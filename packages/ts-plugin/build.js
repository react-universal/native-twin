/* eslint-disable no-console */
const production = process.argv[2] === '--production';
// const watch = process.argv[2] === '--watch';

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: 'build',
    external: ['vscode', '@twind/preset-tailwind', '@twind/core'],
    format: 'cjs',
    platform: 'node',
    watch: !production,
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
