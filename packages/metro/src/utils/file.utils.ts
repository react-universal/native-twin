import fs from 'node:fs';
import path from 'node:path';

export function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file, 'utf8');
}

export function matchCss(filePath: string): boolean {
  return /\.css$/.test(filePath);
}

export const createRuntimeFunction = (functionName: string, contents: string) => {
  return `function ${functionName}() ${createBlockContent(contents)}`;
};
const createBlockContent = (contents: string) => {
  return `{\n return ${contents} \n};\n`;
};
export const createObjectExpression = (values: [string, any][]) => {
  return `{\n ${values.map((x) => createKeyValuePair(x)).join(',')} \n}`;
};
const createKeyValuePair = (value: [string, any]) => {
  return `["${value[0]}"]: ${value[1]}`;
};

export const createCacheDir = (rootPath: string) => {
  const nodeModulesDir = path.join(rootPath, 'node_modules');
  const cacheDir = path.join(nodeModulesDir, '.cache');
  const twinDir = path.join(cacheDir, 'native-twin');
  if (!fs.existsSync(nodeModulesDir)) {
    fs.mkdirSync(nodeModulesDir);
  }
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  if (!fs.existsSync(twinDir)) {
    fs.mkdirSync(twinDir);
  }
};
