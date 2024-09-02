import fs from 'node:fs';
import path from 'node:path';
import {
  TWIN_INPUT_CSS_FILE,
  TWIN_OUT_CSS_FILE,
  TWIN_STYLES_FILE,
  twinModuleExportString,
} from '@native-twin/babel/jsx-babel';

export function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file);
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

export const createCacheDir = (outputDir: string) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outputDir, TWIN_STYLES_FILE), twinModuleExportString);
};

export const createTwinCSSFiles = (outputDir: string, inputCss?: string) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!inputCss) {
    inputCss = path.join(outputDir, TWIN_INPUT_CSS_FILE);
    fs.writeFileSync(inputCss, '');
  }
  const outputCss = path.join(outputDir, TWIN_OUT_CSS_FILE);
  fs.writeFileSync(outputCss, '');
  return {
    inputCss: `${inputCss}`,
    outputCss,
  };
};

export const deleteCacheDir = (outputDir: string) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.rmdirSync(outputDir, { recursive: true });
  }
};
