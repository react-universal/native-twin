const production = process.argv[2] === '--production';

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: false,
    outdir: 'build',
    // external: [
    //   'vscode',
    //   '@native-twin/core',
    //   '@native-twin/preset-tailwind',
    //   '@native-twin/css',
    //   '@native-twin/parser',
    //   '@native-twin/helpers',
    //   'react-native',
    // ],
    format: 'esm',
    logLevel: 'info',
    platform: 'node',
    sourcemap: true,
    minify: false,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
