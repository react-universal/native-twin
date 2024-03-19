import { pluginTester } from 'babel-plugin-tester';
import path from 'path';
import plugin from '../src';

pluginTester({
  plugin,
  title: 'Native Twin babel plugin',
  babelOptions: {
    presets: ['@babel/preset-typescript'],
    plugins: ['@babel/plugin-syntax-jsx'],
    filename: '/someFile.js',
  },
  tests: {
    'createElement by namespace require': {
      // skip: true,
      // only: true,
      codeFixture: path.join('./fixtures/namespace-require/code.js'),
      outputFixture: path.join('./fixtures/namespace-require/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },
    'createElement with interopRequire': {
      // skip: true,
      codeFixture: path.join('./fixtures/interop-require/code.js'),
      outputFixture: path.join('./fixtures/interop-require/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },
    'createElement identifier by default import': {
      // skip: true,
      // only: true,
      codeFixture: path.join('./fixtures/default-import/code.js'),
      outputFixture: path.join('./fixtures/default-import/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },

    'createElement identifier by import': {
      // skip: true,
      // only: true,
      codeFixture: path.join('./fixtures/named-import/code.js'),
      outputFixture: path.join('./fixtures/named-import/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },

    'createElement identifier by require': {
      // skip: true,
      // only: true,
      codeFixture: path.join('./fixtures/named-require/code.js'),
      outputFixture: path.join('./fixtures/named-require/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },

    'createElement by namespace import': {
      // skip: true,
      codeFixture: path.join('./fixtures/namespace-require/code.js'),
      outputFixture: path.join('./fixtures/namespace-require/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },

    'createElement by namespace require (lowercase)': {
      // skip: true,
      codeFixture: path.join('./fixtures/namespace-require-lowercase/code.js'),
      outputFixture: path.join('./fixtures/namespace-require-lowercase/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },

    'createELement from 3rd party': {
      // skip: true,
      codeFixture: path.join('./fixtures/create-third-party/code.js'),
      outputFixture: path.join('./fixtures/create-third-party/output.js'),
      babelOptions: { filename: '/someFile.js' },
    },

    'createElement from denied modules': {
      // skip: true,
      codeFixture: path.join('./fixtures/denied-modules/code.js'),
      outputFixture: path.join('./fixtures/denied-modules/output.js'),
      babelOptions: {
        filename: '/node_modules/@native-twin/native-twin-metro/someFile.js',
      },
    },
  },
});
