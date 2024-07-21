import path from 'path';
import { RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { createTwinFileService } from '../transformer/files/file.service';
import { TWIN_STYLES_FILE, TWIN_CACHE_DIR_RUNTIME } from '../utils/constants';

const globalEntries: SheetEntry[] = [];
const sheetFile = createTwinFileService();
export const twinModuleExportString = 'module.exports = ';

export const createStyleSheetManager = (rootDir: string) => {
  sheetFile.setRootDir(rootDir);
  sheetFile.createFile(TWIN_STYLES_FILE, '', { overwrite: false });

  return {
    registerClassNames,
    setRuntimeSheet,
    registerEntries,
    getRuntimeCode,
    entriesToString,
  };

  function registerClassNames(classNames: string, tw: RuntimeTW) {
    const entries = tw(classNames);
    globalEntries.push(...entries);
    setRuntimeSheet();
  }

  function registerEntries(entries: SheetEntry[]) {
    for (const entry of entries) {
      if (globalEntries.some((x) => x.className === entry.className)) {
        continue;
      }
      globalEntries.push(entry);
    }

    return setRuntimeSheet();
  }

  function setRuntimeSheet() {
    return sheetFile.setFileContents(TWIN_STYLES_FILE, entriesToString());
  }

  function entriesToString() {
    const buffer = sheetFile.getFile(TWIN_STYLES_FILE);
    if (!buffer) return '';

    let code = Buffer.from(buffer).toString('utf-8').replace(twinModuleExportString, '');
    if (code === '') {
      code = '{}';
    }
    const current: any = JSON.parse(code) ?? {};
    const entries = entriesToObject(Object.values(current));
    return `${twinModuleExportString}${JSON.stringify(entries)}`;
    // return sheetEntriesToCss(globalEntries);
  }

  function getRuntimeCode(_fileName: string) {
    const requirePath = path.join(TWIN_CACHE_DIR_RUNTIME, TWIN_STYLES_FILE);
    return `import "${requirePath}"`;
  }
};

function entriesToObject(newEntries: SheetEntry[]) {
  return [...globalEntries, ...newEntries].reduce((p, c) => {
    return Object.assign(p, {
      [c.className]: c,
    });
  }, {});
}

export type StyleManagerHandler = ReturnType<typeof createStyleSheetManager>;
