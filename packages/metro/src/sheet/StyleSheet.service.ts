import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as MHS from 'effect/MutableHashSet';
import fs from 'node:fs';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { twinHMRString, twinModuleExportString } from '../utils/constants';
import { createObjectExpression, createRuntimeFunction } from '../utils/file.utils';
import type { BabelSheetEntry } from './Sheet.model';

export class StyleSheetService extends Context.Tag('files/StyleSheetService')<
  StyleSheetService,
  {
    cssOutput: string;
    getSheetDocumentText(): string;
    refreshSheet(): string;
    registerEntries(entries: BabelSheetEntry[], platform: string): string;
    entriesToObject(newEntries: BabelSheetEntry[]): object;
    readSheet(): string;
    getComponentFunction(componentStyles: [string, RuntimeComponentEntry[]][]): string;
  }
>() {}

const sheetEntries: BabelSheetEntry[] = [];
const entriesSet = MHS.make<BabelSheetEntry[]>();
const currentBuffer = Buffer.from('');

const getCSSOutput = (cssOutput: string) => {
  if (fs.existsSync(cssOutput)) {
    return fs.readFileSync(cssOutput);
  }
  return currentBuffer;
};

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

      const current: BabelSheetEntry[] = JSON.parse(code) ?? {};
      const entries = entriesToObject(Object.values(current));
      return JSON.stringify(entries);
    }

    function entriesToObject(newEntries: BabelSheetEntry[]) {
      return [...sheetEntries, ...newEntries].reduce((p, c) => {
        return Object.assign(p, {
          [c.className]: c,
        });
      }, {});
    }

    function registerEntries(entries: BabelSheetEntry[], platform: string): string {
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

    function refreshSheet(): string {
      let code = getSheetDocumentText();

      code = `${twinModuleExportString}${code}`;

      fs.writeFileSync(cssOutput, code);
      return fs.readFileSync(cssOutput, 'utf-8');
    }
  }),
);
