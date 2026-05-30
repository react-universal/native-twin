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
  outDir: "build",
  exports: true,
});
