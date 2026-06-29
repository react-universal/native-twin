import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    Metro: './src/Metro.ts',
    Babel: './src/Babel.ts',
    Programs: './src/compiler.programs.ts',
    'Metro.transformer': './src/Metro.transformer.ts'
  },
  format: ["esm", 'cjs'],
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: {
    resolver: 'tsc',
    oxc: false,
    incremental: true,
    build: true,
    tsconfig: 'tsconfig.build.json'
  },
  nodeProtocol: 'strip',
  platform: 'neutral',
  outDir: "build",
  sourcemap: true
});
