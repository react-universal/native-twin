import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "src/components/index.ts"
  ],
  format: ["esm", "cjs"],
deps: {
    skipNodeModulesBundle: true
  },
  outDir: "build",
  sourcemap: true,
  exports: true,
});
