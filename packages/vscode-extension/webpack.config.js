/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");

const polyfill = new NodePolyfillPlugin({
  additionalAliases: [
    "process",
    "punycode",
    "fs",
    "console",
    "util",
    "assert",
    "Buffer",
    "url",
    "path",
    "buffer",
    "vm",
  ],
});
/** @type WebpackConfig */
const browserClientConfig = {
  context: path.join(__dirname),
  mode: "none",
  target: "webworker", // web extensions run in a webworker context
  entry: {
    "extension-web": "./src/extension-web.ts",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "build", "cjs"),
    libraryTarget: "commonjs",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
    extensions: [".ts", ".js"], // support ts-files and js-files
    alias: {},
    aliasFields: ["browser"],
    fallback: {
      path: require.resolve('path-browserify'),
      'node:path': require.resolve('path-browserify'),
      fs: false
    },
  },
  module: {
    rules: [
      {
        test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
        use: { loader: "umd-compat-loader" },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
      noParse: [
        require.resolve("@ts-morph/common/dist/typescript.js")
      ]
  },
  externals: {
    vscode: "commonjs vscode", // ignored because it doesn't exist
    // jiti: 'commonjs jiti',
    "node:path": "commonjs path",
    "node:util": "commonjs util",
    "util": "commonjs util",
    "node:fs": "commonjs fs",
    'code-block-writer': "commonjs code-block-writer",
    "fs": "commonjs fs",
    "node:process": "commonjs process"
  },
  performance: {
    hints: false,
  },
  plugins: [polyfill],
  externalsPresets: { node: true },
  devtool: "nosources-source-map",
};

/** @type WebpackConfig */
const browserServerConfig = {
  context: path.join(__dirname, "src/language/browser"),
  mode: "none",
  target: "webworker", // web extensions run in a webworker context
  entry: {
    "twin.worker": "/twin.worker.ts",
  },
  plugins: [
   polyfill
  ],
  externalsPresets: { node: true },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "build", "cjs"),
    libraryTarget: "var",
    library: "serverExportVar",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
    extensions: [".ts", ".js"], // support ts-files and js-files
    alias: {},
    aliasFields: ["browser"],
    fallback: {
    	path: require.resolve("path-browserify"),
      'node:path': require.resolve("path-browserify"),
      util: require.resolve('util'),
      fs: false
    },
  },
  module: {
    rules: [
      {
        test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
        use: { loader: "umd-compat-loader" },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
    noParse: [
      require.resolve("@ts-morph/common/dist/typescript.js")
    ]
  },
  externals: {
    vscode: "commonjs vscode", // ignored because it doesn't exist
    // // jiti: 'commonjs jiti',
    "node:path": "commonjs path",
    // 'code-block-writer': "commonjs code-block-writer",
    "node:util": "commonjs util",
    "util": "commonjs util",
    "node:fs": "commonjs fs",
    "fs": "commonjs fs",
    "node:process": "commonjs process"
  },
  performance: {
    hints: false,
  },
  devtool: "nosources-source-map",
};
module.exports = [browserClientConfig, browserServerConfig];
