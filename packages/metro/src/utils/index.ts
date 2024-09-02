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
