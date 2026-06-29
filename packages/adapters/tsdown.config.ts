import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/next/_app.ts",
    "./src/next/_document.ts",
    "./src/next/app/app.tsx",
  ],
  format: ["esm", "cjs"],
  deps: {
    skipNodeModulesBundle: true,
  },
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
