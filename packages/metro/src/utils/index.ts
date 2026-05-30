import { inspect } from 'util';

export { expoColorSchemeWarning } from './expo';
export {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
} from './unicode.utils';

export const debugInspect = (m: string, x: object) => console.log(m, inspect(x, true, null, true));
