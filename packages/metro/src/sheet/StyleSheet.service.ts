import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as MHS from 'effect/MutableHashSet';
import fs from 'node:fs';
import { Node, Project, SyntaxKind } from 'ts-morph';
import { RuntimeSheetEntry } from '@native-twin/css/jsx';
import { expressionFactory } from '../compiler/ast/writer.factory';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { requireJS } from '../utils';

// import { twinHMRString, twinModuleExportString } from '../utils';

export class StyleSheetService extends Context.Tag('files/StyleSheetService')<
  StyleSheetService,
  {
    cssOutput: string;
    getSheetDocumentText(version: number): string;
    refreshSheet(): Promise<string>;
    registerEntries(entries: RuntimeSheetEntry[], platform: string): Promise<string>;
    entriesToObject(newEntries: RuntimeSheetEntry[]): object;
    readSheet(): string;
  }
>() {}

const sheetEntries: RuntimeSheetEntry[] = [];
const entriesSet = MHS.make<RuntimeSheetEntry[]>();
const currentBuffer = Buffer.from('');

const getCSSOutput = (cssOutput: string) => {
  if (fs.existsSync(cssOutput)) {
    return fs.readFileSync(cssOutput);
  }
  return currentBuffer;
};

const tsCompiler = new Project();

export const StyleSheetServiceLive = Layer.scoped(
  StyleSheetService,
  Effect.gen(function* () {
    const { cssOutput } = yield* MetroTransformerContext;
    const latestCSS = getCSSOutput(cssOutput);

    return {
      cssOutput,
      latestCSS,
      getSheetDocumentText,
      refreshSheet,
      registerEntries,
      entriesToObject,
      readSheet: () => fs.readFileSync(cssOutput, 'utf8'),
    };

    function getSheetDocumentText(version: number) {
      const refreshedFile: Map<string, RuntimeSheetEntry> = requireJS(cssOutput);
      return JSON.stringify(Object.fromEntries(Object.entries(refreshedFile.entries())));
    }

    function entriesToObject(newEntries: RuntimeSheetEntry[]) {
      return [...sheetEntries, ...newEntries].reduce((p, c) => {
        return Object.assign(p, {
          [c.className]: c,
        });
      }, {});
    }

    async function registerEntries(
      entries: RuntimeSheetEntry[],
      platform: string,
    ): Promise<string> {
      entries = entries.filter((x) => {
        if (x.selectors.length === 0) return true;
        const hasWeb = x.selectors.some((x) => x.includes('web'));
        const hasAndroid = x.selectors.some((x) => x.includes('android'));
        const hasIOS = x.selectors.some((x) => x.includes('ios'));
        const hasNative = x.selectors.some((x) => x.includes('native'));
        if (!hasWeb && !hasAndroid && !hasIOS && !hasNative) return true;

        if (hasAndroid && platform === 'android') return true;
        if (hasWeb && platform === 'web') return true;
        if (hasIOS && platform === 'ios') return true;
        if (hasNative && (platform === 'ios' || platform === 'android')) {
          return true;
        }
        return false;
      });
      for (const entry of entries) {
        const exists = pipe(entriesSet, MHS.has(entry));
        if (!exists) {
          entriesSet.pipe(MHS.add(entry), MHS.size);
        }

        if (sheetEntries.some((x) => x.className === entry.className)) {
          continue;
        }
        sheetEntries.push(entry);
      }

      return refreshSheet();
    }

    async function refreshSheet(): Promise<string> {
      const twinStyles = fs.readFileSync(cssOutput, 'utf-8');
      const cssAST = tsCompiler.createSourceFile(cssOutput, twinStyles, {
        overwrite: true,
      });

      const newMap = cssAST.getFirstDescendantByKind(SyntaxKind.NewExpression);
      if (newMap) {
        const EArguments = newMap.getArguments();
        const first = EArguments[0];
        if (first && Node.isArrayLiteralExpression(first)) {
          pipe(
            entriesSet,
            RA.fromIterable,
            // RA.dedupe,
            // RA.filter(
            //   (entry) =>
            //     first.getElements().length === 0 ||
            //     first.getElements().filter((record) => {
            //       const token = record.getFirstDescendantByKind(SyntaxKind.StringLiteral);
            //       return token && token.compilerNode.text === entry.className;
            //     }).length > 0,
            // ),
            (entries) => {
              const mapEntries = RA.map(entries, (x) => [x.className, x] as const);
              mapEntries.forEach((x) => {
                first.addElement((w) => {
                  const { writer, array } = expressionFactory(w);
                  array([x[0], x[1]]);
                  return writer;
                });
              });
            },
          );
        }
      }
      cssAST.saveSync();
      // const text = cssAST.compilerNode.getText();

      // await new Promise((r) => r(fs.writeFileSync(cssOutput, text)));
      return fs.readFileSync(cssOutput, 'utf-8');
    }
  }),
);

export async function refreshTwinFile(
  cssOutput: string,
  entries: RuntimeSheetEntry[],
): Promise<string> {
  const twinStyles = fs.readFileSync(cssOutput, 'utf-8');
  const cssAST = tsCompiler.createSourceFile(cssOutput, twinStyles, {
    overwrite: true,
  });

  const newMap = cssAST.getFirstDescendantByKind(SyntaxKind.NewExpression);
  if (newMap) {
    const EArguments = newMap.getArguments();

    newMap.removeArgument(EArguments[0]);
    const first = newMap.insertArgument(0, '[]');
    if (first && Node.isArrayLiteralExpression(first)) {
      pipe(
        entries,

        RA.filter(
          (entry) =>
            first.getElements().length === 0 ||
            first.getElements().filter((record) => {
              const token = record.getFirstDescendantByKind(SyntaxKind.StringLiteral);
              return token && token.compilerNode.text === entry.className;
            }).length > 0,
        ),
        RA.dedupeWith((a, b) => a.className === b.className),
        RA.forEach((x) => {
          first.addElement((w) => {
            const { writer, array } = expressionFactory(w);
            array([x.className, x]);
            return writer;
          });
        }),
      );
    }
  }
  await cssAST.save();
  const text = cssAST.compilerNode.getText();

  await new Promise((r) => r(fs.writeFileSync(cssOutput, text)));
  return text;
}
