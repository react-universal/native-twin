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
