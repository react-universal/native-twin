import type { IComponentInteractions, TActionTypes } from './components.api';

export type IRegisteredComponent = {
  id: string;
  className?: string;
  styles: Record<string, any>;
  interactionStyles: IComponentInteractions;
};

export type IRegisterComponentArgs = Pick<IRegisteredComponent, 'className' | 'id'> & {
  styles?: IRegisteredComponent['styles'];
};

export type IComponentsStore = {
  registeredComponents: Map<string, IRegisteredComponent>;
  registerComponent: (component: IRegisterComponentArgs) => IRegisteredComponent;
  unregisterComponent: (id: string) => void;
  setComponentInteractions: (
    id: string,
    payload: { kind: TActionTypes; active: boolean },
  ) => void;
};
