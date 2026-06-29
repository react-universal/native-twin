import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/ts-adapter.ts", "./src/babel-adapter.ts"],
  format: ["esm", "cjs"],
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: {
    build: true,
    oxc: false,
    incremental: true,
    resolver: 'tsc',
    tsconfig: "tsconfig.build.json"
  },
  sourcemap: true,
  outDir: "build",
  exports: true,
});
