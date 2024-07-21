import upstreamTransformer from '@expo/metro-config/babel-transformer';
import fs from 'node:fs';
import path from 'node:path';
import { StyleManagerHandler } from '../../twin/Stylesheet.manager';
import { TwinTransformerOptions } from '../../types/transformer.types';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../../utils/constants';

export const cssTransformer = (
  { filename, options, src }: TwinTransformerOptions,
  sheet: StyleManagerHandler,
) => {
  const cssOutput = path.join(options.projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  if (!fs.existsSync(cssOutput)) {
    fs.writeFileSync(cssOutput, '');
  }
  sheet.setRuntimeSheet();
  src = fs.readFileSync(cssOutput, 'utf8');
  src = `${src}\nrequire("@native-twin/metro/build/decorators/server-middlewares/poll-update-client")`;
  // @ts-expect-error
  return upstreamTransformer.transform({ src, filename, options });
};
