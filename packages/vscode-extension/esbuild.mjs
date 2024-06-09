import esbuild from 'esbuild';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
  boolean: ['watch', 'minify'],
});

const context = await esbuild.context({
  entryPoints: ['src/extension.ts'],
  outdir: 'build',
  sourcemap: 'both',
  bundle: true,
  platform: 'node',
  external: ['vscode'],

  format: 'cjs',
  logLevel: 'info',
  minify: true,
});

const serverContext = await esbuild.context({
  entryPoints: ['src/servers/native-twin.server.ts'],
  outdir: 'build',
  sourcemap: 'both',
  bundle: true,
  platform: 'node',
  external: ['vscode'],

  format: 'cjs',
  logLevel: 'info',
  minify: true,
});

console.log('- Building');
await context.rebuild();
await serverContext.rebuild();

if (args.watch) {
  console.log('- Watching');
  await context.watch();
} else {
  console.log('- Cleaning up');
  await context.dispose();
  await serverContext.dispose();
}
