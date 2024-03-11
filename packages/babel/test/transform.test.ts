import pluginTester from 'babel-plugin-tester';
import path from 'path';
import { defineConfig, createTailwind, createVirtualSheet } from '@universal-labs/native-twin';
import nativeTwinBabelPlugin from '../src';

createTailwind(defineConfig({}), createVirtualSheet());

pluginTester({
  plugin: nativeTwinBabelPlugin,
  fixtures: path.join(__dirname, 'fixtures'),
  fixtureOutputExt: 'code.tsx',
  endOfLine: 'preserve',
});
