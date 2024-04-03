import esbuild from 'esbuild';

async function build() {
  await esbuild
    .build({
      outdir: 'build/cjs',
      format: 'cjs',
      logLevel: 'debug',
      entryPoints: ['src/index.ts'],
      bundle: false,
      entryNames: '[dir]/[name]',
      mainFields: ['module', 'main'],
      resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.ts', '.js'],
    })
    .then((x) => {
      console.log('FINISH: ', x);
    })
    .catch((x) => {
      console.error('ERRORS: ', x);
    });
}

build();
