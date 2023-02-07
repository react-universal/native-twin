export type IRegisteredComponent = {
  id: string;
  className?: string;
  styles: Record<string, any>;
};

export type IComponentsStore = {
  registeredComponents: Map<string, IRegisteredComponent>;
  registerComponent: (component: IRegisteredComponent) => IRegisteredComponent;
  unregisterComponent: (id: string) => void;
};
