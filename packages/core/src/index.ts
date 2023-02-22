import { enableMapSet } from 'immer';

enableMapSet();

export type {
  IRegisteredComponent,
  IComponentInteractions,
  IRegisterComponentArgs,
} from './types/store.types';
export { useClassNamesTransform } from './hooks';
export { stylesStore as tailwindStore } from './store';
export type { IStyleType, IStyleTuple } from './types/styles.types';
export type { TPseudoSelectorTypes } from './types/store.types';
export { styled } from './styled';
