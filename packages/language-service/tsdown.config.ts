import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/ts-adapter.ts",
     "./src/babel-adapter.ts",
  ],
  format: ["esm", "cjs"],
deps: {
    skipNodeModulesBundle: true
  },
  outDir: "build",
  exports: true,
});
