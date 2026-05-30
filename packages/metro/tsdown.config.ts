import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
  ],
  deps: {
    skipNodeModulesBundle: true
  },
  format: ["esm", "cjs"],
  outDir: "build",
  sourcemap: true,
  exports: true,
});
