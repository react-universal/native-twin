export { setInteractionState } from './store/components.store';
export { useComponentStyleSheets } from './hooks/useStyleSheets';
// export { setTailwindConfig } from './css';
export { setTailwindConfig } from './store/stylesheet.store';
export type { IStyleType, IStyleTuple, StyledProps } from './types';
export type {
  IComponentsStore,
  IInteractionPayload,
  IRegisterComponentArgs,
  InteractionProps,
  KeyOfMap,
} from './types/store.types';
