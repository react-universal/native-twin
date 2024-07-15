import generate from '@babel/generator';
import { parse, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { RuntimeTW } from '@native-twin/core';
import { visitJSXAttribute } from './jsx/jsx.attribute';
import { visitJSXElement } from './jsx/jsx.element';

export const getDocumentLanguageLocations = (code: string, tw: RuntimeTW) => {
  try {
    const parsed = parse(code, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
      errorRecovery: true,
    });

    traverse(parsed, {
      JSXElement: (path) => {
        visitJSXElement(path);
        path.traverse({
          JSXAttribute: (attribute) => {
            visitJSXAttribute(attribute, tw);
          },
        });
      },
    });

    const generatedCode = generate(parsed);
    // console.log('RESULT: ', generatedCode.code);
    return { parsed, generatedCode };
  } catch {
    // console.log('ERROR: ', e);
    return null;
  }
};

export function parsedToCode(parsed: ParseResult<t.File>) {
  const result = generate(parsed);
  return result;
}
