import { inspect } from 'util';

export { expoColorSchemeWarning } from './expo';
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
