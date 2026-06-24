import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  deps: {
    skipNodeModulesBundle: true,
  },
  outDir: "build",
  sourcemap: true,
  exports: true,
  dts: {
    resolver: 'tsc',
    build: true
  }
});
