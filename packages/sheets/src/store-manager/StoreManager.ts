import type { ValidGroupPseudoSelector, ValidInteractionPseudoSelector } from '../constants';
import type ComponentNode from '../store/ComponentNode';

class StoreManager {
  subscribers = new Set<() => void>();
  componentsRegistry = new Map<string, ComponentNode>();
  static instance: StoreManager;

  private constructor() {}
  static getInstance() {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager();
      StoreManager.instance.subscribe = StoreManager.instance.subscribe.bind(
        StoreManager.instance,
      );
      StoreManager.instance.emitChanges = StoreManager.instance.emitChanges.bind(
        StoreManager.instance,
      );
      StoreManager.instance.setInteractionState =
        StoreManager.instance.setInteractionState.bind(StoreManager.instance);
    }
    return StoreManager.instance;
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

export const store = StoreManager.getInstance();
