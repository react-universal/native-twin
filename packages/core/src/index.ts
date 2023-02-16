export type {
  IRegisteredComponent,
  IComponentInteractions,
  IRegisterComponentArgs,
} from './types/store.types';
export type { IComponentState } from './hooks';
export {
  useTailwind,
  useComponentState,
  useInteraction,
  useClassNamesTransform,
} from './hooks';
export { tailwindStore } from './store';
export type { IStyleType } from './types/styles.types';
