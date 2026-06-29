import { defineConfig, type UserConfig } from "tsdown";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

const getConfig = (entryFile: string, browser = false): UserConfig => ({
  entry: entryFile,
  dts: {
    build: true,
    tsconfig: "tsconfig.build.json",
  },
  deps: {
    neverBundle: ["vscode"],
    alwaysBundle: [
      "effect/*",
      "effect",
      "@native-twin/*",
      "@native-twin/language-service",
      "@native-twin/*/*",
      "vscode-languageclient/*",
      "vscode-languageclient",
      "util/*",
      "util",
      "node:util",
    ],
    skipNodeModulesBundle: false,
  },
  plugins: [
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
    }),
  ],
  nodeProtocol: "strip",
  platform: browser ? "browser" : "node",
  outputOptions: {
    codeSplitting: false,
  },
  alias: {
    "node:util": "util",
  },
  shims: true,

  format: "commonjs",
  sourcemap: true,
  fixedExtension: false,
  outDir: "build",
  exports: false,
});

export default defineConfig([
  getConfig("./src/extension.ts"),
  getConfig("./src/extension-web.ts", true),
  {
    dts: {
      build: true,
      tsconfig: "tsconfig.build.json",
    },
    entry: "./src/servers/lsp.node.ts",
    exports: false,
    outDir: "build",
    sourcemap: true,
    format: "cjs",
    fixedExtension: false,
  },
]);
