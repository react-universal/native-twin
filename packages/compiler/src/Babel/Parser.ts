import * as babelParser from '@babel/parser';
import type { BabelFileAst } from './Models';

const plugins: babelParser.ParserPlugin[] = [
  'asyncGenerators',
  'classProperties',
  'dynamicImport',
  'functionBind',
  'jsx',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'decorators-legacy',
  'typescript',
  'optionalChaining',
  'nullishCoalescingOperator',
];

export const parserOptions: babelParser.ParserOptions = {
  plugins,
  sourceType: 'module',
  errorRecovery: true,
};

const parser = babelParser.parse.bind(babelParser);

export function babelParse(code: string | Buffer, fileName?: string): BabelFileAst {
  const codeString = code.toString();
  try {
    return parser(codeString, parserOptions);
  } catch (err) {
    throw new Error(
      `Error parsing babel: ${err} in ${fileName}, code:\n${codeString}\n ${
        (err as any).stack
      }`,
    );
  }
}
