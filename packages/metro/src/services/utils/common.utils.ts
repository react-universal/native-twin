import fs from 'fs';
import path from 'path';

export const setupCssOutput = (filename: string) => {
  if (!fs.existsSync(filename)) {
    fs.mkdirSync(path.join(require.resolve('@native-twin/core'), '.cache'), {
      recursive: true,
    });
    fs.writeFileSync(filename, '');
  }
};
