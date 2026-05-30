import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/index.web.ts",
    "./src/jsx-runtime.ts",
    "./src/jsx-dev-runtime.ts",
    "./src/testing-library/index.ts",
    "./src/testing-library/setup.ts",
    "./src/sheet/index.ts",
    "./src/components.ts",
    "./src/components.web.ts",
    "./src/testing-library/setupAfterEnv.ts",
  ],
  format: ["esm", "cjs"],
deps: {
    skipNodeModulesBundle: true
  },
  outDir: "build",
  exports: true,
});
