import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    Metro: './src/Metro.ts',
    'Metro.transformer': './src/Metro.transformer.ts'
  },
  format: ["esm", 'cjs'],
  deps: {
    skipNodeModulesBundle: true,
  },
  exports: true,
  outDir: "build",
  sourcemap: true
});
