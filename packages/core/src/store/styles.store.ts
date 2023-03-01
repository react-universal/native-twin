import type { IStyleType } from '../types/styles.types';
import { createObservable } from './observables';

type IStylesStore = {
  [k: string]: { generated: IStyleType };
};
const stylesStore = createObservable<IStylesStore>({});

export { stylesStore };
