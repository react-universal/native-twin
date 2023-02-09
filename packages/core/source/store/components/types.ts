export type TActionTypes = 'hover' | 'active' | 'focus';

export type IInteractionPayload = {
  classNames: string;
  styles: Record<string, any>;
};
export type IComponentInteractions = Map<TActionTypes, IInteractionPayload>;

export type IRegisteredComponent = {
  id: string;
  className?: string;
  styles: Record<string, any>;
  interactionStyles: IComponentInteractions;
  componentState: Record<TActionTypes, boolean>;
};

export type IRegisterComponentArgs = Pick<IRegisteredComponent, 'className' | 'id'> & {
  styles?: IRegisteredComponent['styles'];
};

export type IComponentsStore = {
  registeredComponents: Map<string, IRegisteredComponent>;
  registerComponent: (component: IRegisterComponentArgs) => void;
  unregisterComponent: (id: string) => void;
  setComponentInteractions: (
    id: string,
    payload: { kind: TActionTypes; active: boolean },
  ) => void;
};
