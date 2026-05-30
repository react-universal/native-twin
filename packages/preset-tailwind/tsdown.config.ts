import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/colors.ts",
    "./src/default-config.ts"
  ],
  deps: {
    skipNodeModulesBundle: true
  },
  format: ["esm", "cjs"],
  outDir: "build",
  sourcemap: true,
  exports: true,
});
