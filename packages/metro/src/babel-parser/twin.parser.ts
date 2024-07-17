import generate from '@babel/generator';
import { parse, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import {
  addOrderToJSXChilds,
  compileMappedAttributes,
  createJSXElementHandler,
  StyledPropEntries,
} from '@native-twin/babel/jsx-babel';
import type { RuntimeTW } from '@native-twin/core';

export const parseDocument = (code: string, tw: RuntimeTW) => {
  const compiledClasses: StyledPropEntries['entries'] = [];
  new Map<string, any>()
  try {
    const parsed = parse(code, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
      errorRecovery: true,
    });
    traverse(parsed, {
      JSXElement: (path, state) => {
        const handler = createJSXElementHandler(path);
        addOrderToJSXChilds(handler);

        const classNames = handler.openingElement.extractClassNames();
        const attributes = compileMappedAttributes([...classNames], tw);
        for (const prop of attributes) {
          
          handler.openingElement.addStyledProp(prop);
          compiledClasses.push(...prop.entries);
        }
      },
    });

    const generatedCode = generate(parsed);
    // console.log('RESULT: ', generatedCode.code);
    return { parsed, generatedCode, compiledClasses };
  } catch {
    // console.log('ERROR: ', e);
    return null;
  }
};

export function parsedToCode(parsed: ParseResult<t.File>) {
  const result = generate(parsed);
  return result;
}
