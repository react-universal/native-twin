import esbuild from 'esbuild';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
  boolean: ['watch', 'minify'],
});

const context = esbuild.context({
  entryPoints: ['src/extension.ts'],
  outdir: 'build',
  sourcemap: true,
  platform: 'node',
  external: ['vscode'],
  format: 'cjs',
  target: 'es2020',
  logLevel: 'info',
});

const serverContext = esbuild.context({
  entryPoints: ['src/servers/native-twin.server.ts'],
  outdir: 'build',
  sourcemap: true,
  platform: 'node',
  target: 'es2020',
  external: ['vscode'],
  format: 'cjs',
  logLevel: 'info',
});

function createContexts() {
  return Promise.all([esbuild.context(context), esbuild.context(serverContext)]);
}

createContexts()
  .then((contexts) => {
    const promises = [];
    if (args.watch) {
      for (const context of contexts) {
        promises.push(context.watch());
      }
      return Promise.all(promises).then(() => {
        return undefined;
      });
    } else {
      const promises = [];
      for (const context of contexts) {
        promises.push(context.rebuild());
      }
      Promise.all(promises)
        .then(async () => {
          for (const context of contexts) {
            await context.dispose();
          }
        })
        .then(() => {
          return undefined;
        })
        .catch(console.error);
    }
  })
  .catch(console.error);
