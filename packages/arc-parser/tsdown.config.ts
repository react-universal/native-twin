import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  deps: {
    skipNodeModulesBundle: true,
  },
  outDir: "build",
  dts: { cjsReexport: true },
  sourcemap: true,
  exports: true,
});
