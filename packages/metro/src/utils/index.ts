import { inspect } from 'util';

export { MappedComponent, mappedComponents } from './component.maps';
export {
  METRO_ENDPOINT,
  INTERNAL_RESET,
  INTERNAL_SET,
  INTERNAL_FLAGS,
  DEFAULT_CONTAINER_NAME,
  STYLE_SCOPES,
  transformKeys,
  TWIN_MODULES_CACHE_DIR,
  TWIN_CACHE_DIR,
  TWIN_CACHE_DIR_RUNTIME,
  TWIN_STYLES_FILE,
  platformVariants,
  twinModuleExportString,
  TWIN_GLOBAL_SHEET_IMPORT_NAME,
  twinHMRString,
} from './constants';
export { expoColorSchemeWarning } from './expo';
export {
  ensureBuffer,
  matchCss,
  createRuntimeFunction,
  createObjectExpression,
  createCacheDir,
} from './file.utils';
export { getUserNativeTwinConfig, setupNativeTwin, getTwinConfig } from './load-config';
export { requireJS } from './load-js';
export { splitClasses } from './twin.utils';
export {
  encoder,
  decoder,
  getString,
  getNextCharWidth,
  getUtf8Char,
  getCharacterLength,
} from './unicode.utils';

export const debugInspect = (m: string, x: object) =>
  console.log(m, inspect(x, true, null, true));
