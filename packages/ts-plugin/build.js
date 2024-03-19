const production = process.argv[2] === '--production';

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: 'build',
    external: [
      'vscode',
      '@native-twin/native-twin',
      '@native-twin/preset-tailwind',
      '@native-twin/css',
      '@native-twin/parser',
      '@native-twin/helpers',
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
