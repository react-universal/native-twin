import path from 'path';
import Module from 'module';
import ts from 'typescript/lib/tsserverlibrary';
import { defineConfig } from '@twind/core';
import type { Config as UserConfig } from 'tailwindcss';
import { presetTailwind } from '@universal-labs/twind-adapter';
import { TailwindConfig } from '../types';

const TAILWIND_CONFIG_FILES = [
  'tailwind.config.ts',
  'tailwind.config.mjs',
  'tailwind.config.js',
  'tailwind.config.cjs',
];

export const findConfig = (
  project: ts.server.Project,
  cwd = process.cwd(),
): string | undefined => {
  const locatePath = (files: string[]) =>
    files.map((file) => path.resolve(cwd, file)).find((file) => project.fileExists(file));

  return locatePath(TAILWIND_CONFIG_FILES);
};

export const loadFile = <T>(file: string, cwd = process.cwd()): T => {
  const moduleId = path.resolve(cwd, file);

  try {
    const require = Module.createRequire?.(path.resolve(cwd, file));
    return require(moduleId) as T;
  } catch (error: any) {
    console.error(`Failed to load ${moduleId}: ${error.stack}`);
    return {} as T;
  }
};

export const loadConfig = (configFile: string, cwd = process.cwd()) => {
  const exports = loadFile<{ default: UserConfig } & UserConfig>(configFile, cwd);

  const config = exports.default || exports || {};

  return defineConfig({
    theme: config.theme,
    darkMode: config.darkMode as 'class',
    presets: [presetTailwind()],
  });
};

export const getConfig = (
  project: ts.server.Project,
  cwd = process.cwd(),
  configFile?: string,
): TailwindConfig & { configFile: string | undefined } => {
  console.log('CONFIG_FILE: ', configFile);

  return {
    ...((configFile ? loadConfig(path.resolve(cwd, configFile), cwd) : {}) as TailwindConfig),
    configFile,
  };
};
