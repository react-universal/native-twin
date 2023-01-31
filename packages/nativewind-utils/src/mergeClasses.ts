import clsx from 'clsx';
import { TW } from './types';

const mergeTWClasses = (tw?: TW) => {
  return clsx(tw);
};

export { mergeTWClasses };
