import generate from '@babel/generator';
import { parse, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import {
  addOrderToJSXChilds,
  compileMappedAttributes,
  createJSXElementHandler,
  RuntimeComponentEntry,
  StyledPropEntries,
} from '@native-twin/babel/jsx-babel';
import type { RuntimeTW } from '@native-twin/core';

export const parseDocument = (
  fileName: string,
  version: number,
  code: string,
  tw: RuntimeTW,
) => {
  const compiledClasses: StyledPropEntries['entries'] = [];
  const twinComponentStyles = new Map<string, RuntimeComponentEntry[]>();
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
        const componentStyles: RuntimeComponentEntry[] = [];
        const uid = path.scope.generateUidIdentifier(fileName);
        const id = `${uid.name}-${version}`;
        for (const prop of attributes) {
          handler.openingElement.addStyledProp(id, prop);
          compiledClasses.push(...prop.entries);
          const runtime = handler.openingElement.styledPropsToObject(prop);
          componentStyles.push(runtime[1]);
        }
        twinComponentStyles.set(id, componentStyles);
      },
    });

    const generatedCode = generate(parsed);
    // console.log('RESULT: ', generatedCode.code);
    console.log('STYLES: ', twinComponentStyles);
    return { parsed, generatedCode, compiledClasses, twinComponentStyles };
  } catch (e) {
    console.log('ERROR: ', e);
    return null;
  }
};

export function parsedToCode(parsed: ParseResult<t.File>) {
  const result = generate(parsed);
  return result;
}
