import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as MHS from 'effect/MutableHashSet';
import fs from 'node:fs';
import type { SheetEntry } from '@native-twin/css';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { twinHMRString, twinModuleExportString } from '../utils';

export class StyleSheetService extends Context.Tag('files/StyleSheetService')<
  StyleSheetService,
  {
    cssOutput: string;
    getSheetDocumentText(version: number): string;
    refreshSheet(): string;
    registerEntries(entries: SheetEntry[], platform: string): string;
    entriesToObject(newEntries: SheetEntry[]): object;
    readSheet(): string;
    // getComponentFunction(componentStyles: [string, RuntimeComponentEntry[]][]): string;
  }
>() {}

const sheetEntries: SheetEntry[] = [];
const entriesSet = MHS.make<SheetEntry[]>();
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
    };

    function getSheetDocumentText(version: number) {
      const twinStyles = fs.readFileSync(cssOutput, 'utf-8');
      if (!twinStyles)
        return `{"version": ${version},"cssOutput": "${cssOutput}", "entries": {}}`;

      let code = `${twinStyles.replace(new RegExp(twinModuleExportString, 'g'), ' ')}`;
      code = code.replace(
        "require('@native-twin/metro/build/metro/server/poll-update-client')",
        ' ',
      );
      code = `${code.replace(/\n/g, ' ')}`;

      if (code === '') {
        code = `{"version": ${version},"cssOutput": "${cssOutput}", "entries": {}}`;
      }
      // console.log('CODE: ', code);
      try {
        const current: Record<string, any> = JSON.parse(code) ?? {};
        const entries = entriesToObject(Object.values(current?.['entries'] ?? {}));
        return JSON.stringify({ version, cssOutput, entries });
      } catch (e: any) {
        console.log('PARSER_ERROR: ', e);
        return `{"version": ${version},"cssOutput": "${cssOutput}", "entries": {}}`;
      }
    }

    function entriesToObject(newEntries: SheetEntry[]) {
      return [...sheetEntries, ...newEntries].reduce((p, c) => {
        return Object.assign(p, {
          [c.className]: c,
        });
      }, {});
    }

    function registerEntries(entries: SheetEntry[], platform: string): string {
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
      let code = getSheetDocumentText(1);

      code = `${twinModuleExportString}${code}`;
      code = `${code}\n${twinHMRString}`;

      fs.writeFileSync(cssOutput, code);
      return fs.readFileSync(cssOutput, 'utf-8');
    }
  }),
);
