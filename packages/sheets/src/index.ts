import { default as ComponentStyleSheet } from './sheets/ComponentStyleSheet';
import globalStyleSheet from './sheets/GlobalStyleSheet';
import ComponentNode from './store/ComponentNode';

export { createStore } from './store/generator';
export { setComponentInteractionState } from './store/global.store';
export { useComponentStyleSheets } from './hooks/useStyleSheets';
export { setTailwindConfig } from './css';
export { globalStyleSheet, ComponentStyleSheet };
export { ComponentNode };
export type {
  IStyleType,
  IStyleTuple,
  TAppearancePseudoSelectors,
  TInteractionPseudoSelectors,
  TInternalStyledComponentProps,
} from './types';
export type {
  IClassNamesStyle,
  IComponent,
  IComponentAppearance,
  IComponentInteractions,
  IComponentsStore,
  IExtraProperties,
  IInteractionPayload,
  IRegisterComponentArgs,
  IRegisteredComponent,
  InteractionProps,
  KeyOfMap,
} from './types/store.types';
