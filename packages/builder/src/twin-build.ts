import esbuild from 'esbuild';
import minimist from 'minimist';
import path from 'path';

const args = minimist(process.argv.slice(2), {
  boolean: ['watch', 'minify'],
});

const ctx = await esbuild.context({
  outdir: path.join(process.cwd(), 'build/esm'),
  format: 'esm',
  logLevel: 'debug',
  entryPoints: [path.join(process.cwd(), 'src/index.ts')],
  external: ['react-native', 'react-native-web', 'react', 'react-is', '@native-twin/*'],
  bundle: true,
  
  splitting: true,
  entryNames: '[dir]/[name]',
  mainFields: ['module', 'main'],
  resolveExtensions: [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    '.ts',
    '.js',
    '.tsx',
    '.jsx',
  ],

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
