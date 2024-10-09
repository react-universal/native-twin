import esbuild from 'esbuild';
import minimist from 'minimist';
import path from 'path';

const args = minimist(process.argv.slice(2), {
  boolean: ['watch', 'minify'],
});

esbuild
  .context({
    entryPoints: [
      path.join(process.cwd(), './src/twin-cli.ts'),
      path.join(process.cwd(), './src/config/twin.schema.ts'),
    ],
    outdir: 'build',
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    logLevel: 'info',
    packages: 'external',
    bundle: true,
    external: [
      'esbuild',
      'tsup',
      '@babel/*',
      'effect',
      '@effect/*',
      'rollup',
      'rollup-plugin-dts',
      '@rollup/plugin-terser',
      '@rollup/plugin-typescript',
      'glob',
    ],
    minify: false,
  })
  .then(async (x) => {
    await x.rebuild();
    if (args.watch) {
      return x.watch();
    }
    x.dispose();
  });
