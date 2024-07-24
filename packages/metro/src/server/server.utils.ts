import type { SheetEntry } from '@native-twin/css';

export const entriesToServerUpdateString = (data: SheetEntry, version: number) => {
  const raw = {
    data,
    version,
  };

  return `data: ${JSON.stringify(raw)}`;
};

export const serverUpdateStringToObject = (data: string) => {
  let toParse = data;
  if (toParse.startsWith('data: ')) {
    toParse = toParse.replace('data: ', '');
  }

  return JSON.parse(toParse);
};
