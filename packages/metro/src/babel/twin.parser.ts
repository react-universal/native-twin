// @ts-noCheck
import generate from '@babel/generator';
import type { ParseResult } from '@babel/parser';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as Option from 'effect/Option';
import type { RuntimeComponentEntry } from '@native-twin/babel/jsx-babel';
import { createRequireExpression } from '@native-twin/babel/jsx-babel';
import type { RuntimeTW } from '@native-twin/core';
import type { BabelSheetEntry } from '../sheet/Sheet.model';
import { TWIN_GLOBAL_SHEET_IMPORT_NAME, TWIN_STYLES_FILE } from '../utils/constants';
import { BabelFileModel } from './models/File.model';
import { JSXElementModel } from './models/JsxElement.model';
import { JSXOpeningElementModel } from './models/JsxOpeningElement.model';
import { createRegisterComponentFunction } from './utils/babel.utils';

export const parseDocument = (
  filename: string,
  version: number,
  code: string,
  tw: RuntimeTW,
) => {
  const compiledClasses: BabelSheetEntry[] = [];
  const twinComponentStyles = new Map<string, RuntimeComponentEntry[]>();
  try {
    const parsed = parseCode(code);
    let alreadyImportGlobalSheet = false;
    traverse(parsed, {
      JSXElement: (path) => {
        const component = new JSXElementModel({
          element: path,
          filename,
          version,
          openingElement: new JSXOpeningElementModel({
            node: path.node.openingElement,
          }),
        });
        component.addOrderToChilds();

        const runtimeResult = component.openingElement
          .buildAttributes(component.elementID, tw)
          .pipe(Option.getOrNull);

        if (!runtimeResult) return;

        if (runtimeResult.componentStyles.length > 0) {
          const compileSheet = t.jsxAttribute(
            t.jsxIdentifier('_twinComponentSheet'),
            t.jsxExpressionContainer(
              createRegisterComponentFunction(
                component.elementID,
                runtimeResult.entriesAST,
              ),
            ),
          );
          component.openingElement.node.attributes.push(compileSheet);
        }
        component.openingElement.node.attributes.push(
          createJSXComponentID(component.elementID),
        );
        twinComponentStyles.set(component.elementID, runtimeResult.componentStyles);
        path.replaceWith(component.node);
        compiledClasses.push(...runtimeResult.sheetEntries);

        if (!alreadyImportGlobalSheet) {
          const programScope = component.element.scope.getProgramParent();
          if (t.isProgram(programScope.path.node)) {
            let foundImport = 0;
            let lastImportDeclaration: t.ImportDeclaration | null = null;
            for (const statement of programScope.path.node.body) {
              if (t.isImportDeclaration(statement)) {
                lastImportDeclaration = statement;
                continue;
              }

              if (lastImportDeclaration) {
                programScope.path.node.body.splice(
                  foundImport + 1,
                  0,
                  createGlobalSheetImport(),
                );
                break;
              }
              foundImport++;
            }
          }
          alreadyImportGlobalSheet = true;
        }
      },
    });

    const generatedCode = parsedToCode(parsed);
    return new BabelFileModel({
      entries: compiledClasses,
      filename,
      code: generatedCode.code,
      styledProps: twinComponentStyles,
    });
  } catch (e: any) {
    console.log('ERROR: ', {
      message: e.message,
      code,
    });
    return null;
  }
};

const createJSXComponentID = (componentID: string) =>
  t.jsxAttribute(t.jsxIdentifier('_twinComponentID'), t.stringLiteral(componentID));

const createGlobalSheetImport = () =>
  t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(TWIN_GLOBAL_SHEET_IMPORT_NAME),
      createRequireExpression(
        `.cache/native-twin/${TWIN_STYLES_FILE.replace('.js', '')}`,
      ),
    ),
  ]);

const parseCode = (code: string) =>
  parse(code, {
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
    errorRecovery: true,
  });

export function parsedToCode(parsed: ParseResult<t.File>) {
  return generate(parsed);
}
