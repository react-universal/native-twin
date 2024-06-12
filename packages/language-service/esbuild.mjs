// const production = process.argv[2] === '--production';
import esbuild from 'esbuild';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
  boolean: ['watch', 'minify'],
});

const ctxServer = await esbuild.context({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outdir: 'build',
  external: ['vscode'],
  
  format: 'esm',
  logLevel: 'info',
  platform: 'node',
  sourcemap: 'both',
  minify: false,
});

console.log('- Building');
await ctxServer.rebuild();

if (args.watch) {
  console.log('- Watching');
  await ctxServer.watch();
} else {
  console.log('- Cleaning up');
  await ctxServer.dispose();
}
