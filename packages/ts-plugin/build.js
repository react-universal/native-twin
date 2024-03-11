const production = process.argv[2] === '--production';

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: 'build',
    external: [
      'vscode',
      '@universal-labs/native-twin',
      '@universal-labs/preset-tailwind',
      '@universal-labs/css',
      '@universal-labs/parser',
      '@universal-labs/helpers',
      'react-native',
    ],
    format: 'cjs',
    logLevel: 'info',
    platform: 'node',
    sourcemap: !production,
    minify: production,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
