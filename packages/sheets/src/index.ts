import { default as ComponentStyleSheet } from './sheets/ComponentStyleSheet';
import globalStyleSheet from './sheets/GlobalStyleSheet';
import ComponentNode from './store/ComponentNode';

export { createStore } from './store/generator';
export { setComponentInteractionState } from './store/global.store';
export { setInteractionState } from './store/styles.store';
export { useComponentStyleSheets } from './hooks/useStyleSheets';
export { setTailwindConfig } from './css';
export { globalStyleSheet, ComponentStyleSheet };
export { ComponentNode };
export type { IStyleType, IStyleTuple, StyledProps } from './types';
export type {
  IComponentsStore,
  IInteractionPayload,
  IRegisterComponentArgs,
  InteractionProps,
  KeyOfMap,
} from './types/store.types';
