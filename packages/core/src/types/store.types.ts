import type { IStyleType, IStyleTuple } from './styles.types';

export type TPseudoSelectorTypes = 'hover' | 'active' | 'focus' | 'dark';

export type IInteractionPayload = {
  classNames: string;
  styles: IStyleType;
};
export type IComponentInteractions = [TPseudoSelectorTypes, IInteractionPayload];
export type ISetComponentInteractionArgs = {
  kind: TPseudoSelectorTypes;
  active: boolean;
};

export type IComponent = {
  id: string;
  className?: string;
  styles: IStyleType;
  interactionStyles: IComponentInteractions[];
};

type IComponentID = string;

export type IRegisteredComponent = [IComponentID, IComponent];

export type IRegisterComponentArgs = {
  id: IComponentID;
  className?: string;
  inlineStyles: IStyleType;
};

export type IComponentsStore = {
  components: IRegisteredComponent[];
  styles: IStyleTuple[];
  registerComponent: (data: IRegisterComponentArgs) => IRegisteredComponent;
  unregisterComponent: (id: string) => void;
};

export type KeyOfMap<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown>
  ? K
  : never;
