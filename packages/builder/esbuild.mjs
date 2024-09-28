import esbuild from 'esbuild';
import path from 'path';

esbuild
  .build({
    entryPoints: [path.join(process.cwd(), './src/twin-cli.ts')],
    // outExtension: {
    //   '.js': '.cjs',
    // },
    outdir: 'build',
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    logLevel: 'info',
    packages: 'external',
    bundle: true,
    external: ['esbuild', '@babel/*', 'effect', '@effect/*'],
    minify: false,
  })
  .catch(console.error);
