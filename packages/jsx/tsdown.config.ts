import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/index.web.ts",
    "./src/jsx-runtime.ts",
    "./src/jsx-dev-runtime.ts",
    // "./src/testing-library/index.ts",
    // "./src/testing-library/setup.ts",
    "./src/sheet/index.ts",
    "./src/components.ts",
    "./src/components.web.ts",
    // "./src/testing-library/setupAfterEnv.ts",
    "./src/types.ts"
  ],
  format: "esm",
  deps: {
    skipNodeModulesBundle: true,
  },
  treeshake: false,
  unbundle: true,
  fixedExtension: false,
  outExtensions: (c) => ({ dts: ".ts", js: ".js" }),
  shims: false,
  outputOptions: {
    polyfillRequire: false,
    dynamicImportInCjs: false,
  },
  dts: {
    resolver: 'tsc'
  },
  sourcemap: true,
  outDir: "build",
  exports: true,
});
