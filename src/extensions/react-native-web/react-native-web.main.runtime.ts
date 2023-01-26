import { BabelAspect, BabelMain } from "@teambit/babel";
import { MainRuntime } from "@teambit/cli";
import { EnvsAspect, EnvsMain } from "@teambit/envs";
import { ReactNativeAspect, ReactNativeMain } from "@teambit/react-native";

import { ReactNativeWebAspect } from "./react-native-web.aspect";
import {
  previewConfigTransformer,
  devServerConfigTransformer,
} from "./webpack/webpack-transformers";

// const babelConfig = require("./babel/babel.config");
// const tsConfig = require("./typescript/tsconfig");

export class ReactNativeWebMain {
  static slots = [];

  static dependencies = [ReactNativeAspect, EnvsAspect, BabelAspect];

  static runtime = MainRuntime;

  static async provider([reactNative, envs, babel]: [
    ReactNativeMain,
    EnvsMain,
    BabelMain
  ]) {
    const babelCompiler = babel.createCompiler({
      babelTransformOptions: {
        babelrc: false,
        configFile: false,
        presets: [
          'next/babel',
          [
            'babel-preset-expo',
            {
              jsxRuntime: 'automatic',
              jsxImportSource: 'react',
              lazyImports: true,
            },
          ],
        ],
        plugins: [
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }],
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
          ['nativewind/babel'],
        ],
      },
    });

    const compilerBuildTask = [babelCompiler.createTask()];

    const overrideObj = {
      getCompiler: () => babelCompiler,
      getBuildPipe: () => compilerBuildTask,
    };

    const compilerTransformer = envs.override(overrideObj);

    const templatesReactNativeEnv = envs.compose(reactNative.reactNativeEnv, [
      compilerTransformer,

      reactNative.useTypescript({
        buildConfig: [
          (config) => {
            config.setTsConfig({
              compilerOptions: {
                allowJs: true,
                esModuleInterop: true,
                jsx: 'react-jsx',
                lib: ['DOM', 'ESNext', 'DOM.Iterable'],
                moduleResolution: 'node',
                skipLibCheck: true,
                target: 'ESNext',
                strict: false,
                module: 'esnext',
                sourceMap: true,
              },
              exclude: [
                'node_modules',
                'babel.config.js',
                'metro.config.js',
                'jest.config.js',
              ],
            });
            config.setCompileJsx(true);
            return config;
          },
        ],
        devConfig: [
          (config) => {
            config.setTsConfig({
              compilerOptions: {
                allowJs: true,
                esModuleInterop: true,
                jsx: 'react-jsx',
                lib: ['DOM', 'ESNext', 'DOM.Iterable'],
                moduleResolution: 'node',
                skipLibCheck: true,
                target: 'ESNext',
                strict: false,
                module: 'esnext',
                sourceMap: true,
              },
              exclude: [
                'node_modules',
                'babel.config.js',
                'metro.config.js',
                'jest.config.js',
              ],
            });
            config.setCompileJsx(true);
            return config;
          },
        ],
      }),

      // reactNative.overrideJestConfig(require.resolve('./jest/jest.config')),

      reactNative.useWebpack({
        previewConfig: [previewConfigTransformer],
        devServerConfig: [devServerConfigTransformer],
      }),

      /**
       * override the ESLint default config here then check your files for lint errors
       * @example
       * bit lint
       * bit lint --fix
       */
      reactNative.useEslint({
        transformers: [
          (config: any) => {
            config.setRule("no-console", ["error"]);
            return config;
          },
        ],
      }),

      /**
       * override the Prettier default config here the check your formatting
       * @example
       * bit format --check
       * bit format
       */
      reactNative.usePrettier({
        transformers: [
          (config: any) => {
            config.setKey("tabWidth", 2);
            return config;
          },
        ],
      }),

      /**
       * override dependencies here
       * @example
       */
      reactNative.overrideDependencies({
        dependencies: {
          nativewind: '2.0.11',
          tailwindcss: '^3.2.4',
        },
        peerDependencies: {
          '@types/react': '18.0.23',
          '@types/react-dom': '18.0.7',
          '@types/react-native': '0.69.5',
          react: '18.0.0',
          'react-dom': '18.0.0',
          'react-native-web': '0.18.7',
        },
        devDependencies: {
          '@types/react': '18.0.23',
          '@types/react-dom': '18.0.7',
          '@types/react-native': '0.69.5',
          react: '18.2.0',
          'react-dom': '18.2.0',
          'react-native-web': '0.18.10',
          '@babel/core': '^7.18.6',
          '@babel/preset-env': '^7.17.10',
          '@babel/runtime': '^7.18.3',
        },
      }),
    ]);

    envs.registerEnv(templatesReactNativeEnv);

    return new ReactNativeWebMain();
  }
}

ReactNativeWebAspect.addRuntime(ReactNativeWebMain);
