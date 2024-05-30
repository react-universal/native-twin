import esbuild from 'esbuild';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
  boolean: ['watch', 'minify'],
});

const ctx = await esbuild.context({
  outdir: 'build/cjs',
  format: 'cjs',
  logLevel: 'debug',
  entryPoints: ['src/index.ts'],
  bundle: false,
  entryNames: '[dir]/[name]',
  mainFields: ['module', 'main'],
  resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.ts', '.js'],
});

console.log('- Building');
await ctx.rebuild();

if (args['watch']) {
  console.log('- Watching');
  await ctx.watch();
} else {
  console.log('- Cleaning up');
  await ctx.dispose();
}
