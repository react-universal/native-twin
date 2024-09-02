import { inspect } from 'util';

export { MappedComponent, mappedComponents } from './component.maps';
export { expoColorSchemeWarning } from './expo';
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
