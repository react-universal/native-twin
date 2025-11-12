import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { StoredTwinComponent } from './StoredTwinComponent';

export class TwinComponentStore {
  // private twin: RuntimeTW<__Theme__>;
  private _registry = new Map<string, StoredTwinComponent>();

  constructor() {
    // this.twin = twin;
  }

  registerComponent(runtime: TwinRuntimeComponent) {
    this._registry.set(runtime.id, new StoredTwinComponent(runtime));
  }

  getComponent(id: string) {
    const cached = this._registry.get(id);
    if (cached) {
      // console.log('cached', id);
      return cached;
    }
    this._registry.set(id, new StoredTwinComponent(createEmptyStoredComponent(id)));
    const result = this._registry.get(id)!;
    // console.log('REGISTRY: ', result);
    return result;
  }
}

export const styledJSXStore = new TwinComponentStore();

const createEmptyStoredComponent = (id: string): TwinRuntimeComponent => ({
  id,
  childStyles: [],
  index: -1,
  metadata: { hasGroupEvents: false, hasPointerEvents: false, isGroupParent: false },
  parentID: null,
  parentSize: -1,
  childIds: [],
  props: [],
});
