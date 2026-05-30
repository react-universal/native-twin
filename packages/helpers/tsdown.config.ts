import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/tree.ts",
    "./src/fp/index.ts",
    "./src/react.ts",
    "./src/server.ts",
    "./src/KeyMap.ts",
  ],
  format: ["esm", "cjs"],
deps: {
    skipNodeModulesBundle: true
  },
  outDir: "build",
  exports: true,
});
