import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/jsx/index.ts",
    "./src/react-native/index.ts",
    "./src/twin-parser.ts",
  ],
  deps: {
    skipNodeModulesBundle: true
  },
  format: ["esm", "cjs"],
  outDir: "build",
  exports: true,
});
