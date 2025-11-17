const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup: async (build) => {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd(async (result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['./src/extension.browser.ts'] ,
    allowOverwrite: true,
    keepNames: true,
    outfile: "build/web/extension.js",
    write: true,
    bundle: true,
    format: 'esm',
    minify: production,
    sourcemap: !production,
    sourcesContent: true,
    platform: 'browser',
    external: ['vscode'],
    logLevel: 'info',
    tsconfig: "tsconfig.json",
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
  });

  if (watch) {
    // await ctx.rebuild();
    await ctx.watch();
    // await ctx.dispose()
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
