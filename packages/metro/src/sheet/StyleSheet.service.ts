import * as ReadOnlyArray from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import fs from 'node:fs';
import path from 'node:path';
import { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import { SheetEntry } from '@native-twin/css';
import { MetroTransformContext } from '../transformer/transformer.service';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../utils/constants';
import { createObjectExpression, createRuntimeFunction } from '../utils/file.utils';

interface StyleSheetShape {
  entries: SheetEntry[];
  cssOutput: string;
  twinModuleExportString: string;
  getSheetDocumentText(): string;
  refreshSheet(isDev: boolean): string;
  registerEntries(entries: SheetEntry[]): string;
  entriesToObject(newEntries: SheetEntry[]): object;
  readSheet(): string;
  getComponentFunction(componentStyles: [string, RuntimeComponentEntry[]][]): string;
}

export class StyleSheetService extends Context.Tag('files/StyleSheetService')<
  StyleSheetService,
  StyleSheetShape
>() {}

const twinModuleExportString = 'module.exports = ';
const twinHMRString = 'require("@native-twin/metro/build/server/poll-update-client")';
const sheetEntries = ReadOnlyArray.empty<SheetEntry>();

export const StyleSheetServiceLive = Layer.scoped(
  StyleSheetService,
  Effect.gen(function* () {
    const { options } = yield* MetroTransformContext;

    const cssOutput = path.join(options.projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);

    if (!fs.existsSync(cssOutput)) {
      fs.writeFileSync(cssOutput, '');
    }

    return {
      entries: sheetEntries,
      cssOutput,
      twinModuleExportString,
      getSheetDocumentText,
      refreshSheet,
      registerEntries,
      entriesToObject,
      readSheet: () => fs.readFileSync(cssOutput, 'utf8'),
      getComponentFunction,
    };

    function getComponentFunction(componentStyles: [string, RuntimeComponentEntry[]][]) {
      const componentsContent = componentStyles.map(([key, value]): [string, any] => {
        const objValue = `require("@native-twin/jsx").StyleSheet.registerComponent("${key}", ${JSON.stringify(value)})`;

        return [key, objValue];
      });
      const fn = createRuntimeFunction(
        'get_compiled____styles___',
        createObjectExpression(componentsContent),
      );
      return fn;
    }

    function getSheetDocumentText() {
      const twinStyles = fs.readFileSync(cssOutput);
      if (!twinStyles) return '';

      let code = Buffer.from(twinStyles)
        .toString('utf-8')
        .replace(twinModuleExportString, '');
      code = code.replace(twinHMRString, '');

      if (code === '') {
        code = '{}';
      }

      const current: SheetEntry[] = JSON.parse(code) ?? {};
      const entries = entriesToObject(Object.values(current));
      return JSON.stringify(entries);
    }

    function entriesToObject(newEntries: SheetEntry[]) {
      return [...sheetEntries, ...newEntries].reduce((p, c) => {
        return Object.assign(p, {
          [c.className]: c,
        });
      }, {});
    }

    function registerEntries(entries: SheetEntry[]): string {
      for (const entry of entries) {
        if (sheetEntries.some((x) => x.className === entry.className)) {
          continue;
        }
        sheetEntries.push(entry);
      }

      return refreshSheet(options.dev);
    }

    function refreshSheet(isDev: boolean): string {
      let code = getSheetDocumentText();

      code = `${twinModuleExportString}${code}`;
      // if (isDev) {
      //   code = `${code}\n${twinHMRString}`;
      // }

      fs.writeFileSync(cssOutput, code);
      return fs.readFileSync(cssOutput, 'utf-8');
    }
  }),
);
