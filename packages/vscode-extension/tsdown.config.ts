import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/extension.ts",
    "./src/extension-web.ts",
    "./src/language/browser/twin.worker.ts",
    "./src/servers/lsp.node.ts",
    "./src/servers/lsp.browser.ts",
  ],
  deps: {
    skipNodeModulesBundle: true,
  },
  format: ["esm", "cjs"],
  outDir: "build",
  exports: true,
});
