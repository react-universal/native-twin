import { defineConfig } from "tsdown";

export default defineConfig((c) => ({
  entry: ["./src/index.ts", "src/components/index.ts"],
  format: ["esm", "cjs"],
  deps: {
    skipNodeModulesBundle: true,
  },
  outDir: "build",
  clean: !!c.watch,
  sourcemap: true,
  exports: true,
}));
