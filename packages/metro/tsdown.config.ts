import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/programs/metro.transformer.ts"
  ],
  deps: {
    skipNodeModulesBundle: true
  },
  format: 'cjs',
  fixedExtension: false,
  outDir: "build",
  sourcemap: true,
  exports: true,
});
