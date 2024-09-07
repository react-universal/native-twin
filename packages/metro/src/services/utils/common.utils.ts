import fs from 'fs';
import path from 'path';
import { TWIN_CACHE_DIR } from '@native-twin/babel/jsx-babel';

export const setupCssOutput = (filename: string) => {
  if (!fs.existsSync(filename)) {
    fs.mkdirSync(path.resolve(TWIN_CACHE_DIR), { recursive: true });
    fs.writeFileSync(filename, '');
  }
};
