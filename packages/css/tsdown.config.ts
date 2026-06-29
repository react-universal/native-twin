import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/jsx/index.ts",
    "./src/react-native/index.ts",
    "./src/twin-parser.ts",
  ],
  deps: {
    skipNodeModulesBundle: true,
  },
  format: ["esm", "cjs"],
  sourcemap: true,
  outDir: "build",
  exports: true,
  dts: {
    build: true,
    oxc: false,
    incremental: true,
    resolver: 'tsc',
    tsconfig: "tsconfig.build.json"
  }
});
