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
    build: true,
    oxc: false,
    incremental: true,
    resolver: 'tsc',
    tsconfig: "tsconfig.build.json"
  }
});
