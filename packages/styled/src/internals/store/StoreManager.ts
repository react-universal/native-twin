import type {
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
} from '../../constants/ValidPseudoElements';
import type ComponentNode from './ComponentNode';

class StoreManagerClass {
  subscribers = new Set<() => void>();
  componentsRegistry = new Map<string, ComponentNode>();
  static instance: StoreManagerClass;

  private constructor() {}
  static getInstance() {
    if (!StoreManagerClass.instance) {
      StoreManagerClass.instance = new StoreManagerClass();
      StoreManagerClass.instance.subscribe = StoreManagerClass.instance.subscribe.bind(
        StoreManagerClass.instance,
      );
      StoreManagerClass.instance.emitChanges = StoreManagerClass.instance.emitChanges.bind(
        StoreManagerClass.instance,
      );
      StoreManagerClass.instance.setInteractionState =
        StoreManagerClass.instance.setInteractionState.bind(StoreManagerClass.instance);
    }
    return StoreManagerClass.instance;
  }

  subscribe(fn: () => void) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  emitChanges() {
    this.subscribers.forEach((fn) => fn());
  }

  registerComponentInStore(input: ComponentNode) {
    if (this.componentsRegistry.has(input.id)) {
      return this.componentsRegistry.get(input.id);
    }
    this.componentsRegistry.set(input.id, input);
    return this.componentsRegistry.get(input.id)!;
  }

  setInteractionState(
    id: string,
    interaction: ValidInteractionPseudoSelector | ValidGroupPseudoSelector,
    value: boolean,
  ) {
    if (this.componentsRegistry.has(id)) {
      const component = this.componentsRegistry.get(id)!;
      component.setInteractionState(interaction, value);
      this.emitChanges();
    }
  }
}

export const StoreManager = StoreManagerClass.getInstance();
