import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { styledContext } from './observables';
import { StoredTwinComponent } from './StoredTwinComponent';

export class TwinComponentStore {
  // private twin: RuntimeTW<__Theme__>;
  private _registry = new Map<string, StoredTwinComponent>();

  constructor() {
    // this.twin = twin;
  }

  registerComponent(runtime: TwinRuntimeComponent) {
    this._registry.set(runtime.id, new StoredTwinComponent(runtime, styledContext.get()));
  }

  getComponent(id: string) {
    return this._registry.get(id);
  }
}

export const styledJSXStore = new TwinComponentStore();
