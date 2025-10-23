import type { __Theme__, RuntimeTW } from '@native-twin/core';
import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { styledContext } from './observables';
import { StoredTwinComponent } from './StoredTwinComponent';

export abstract class TwinComponentStore {
  // private twin: RuntimeTW<__Theme__>;
  private _registry = new Map<string, StoredTwinComponent>();

  constructor(_twin: RuntimeTW<__Theme__>) {
    // this.twin = twin;
  }

  registerComponent(runtime: TwinRuntimeComponent) {
    this._registry.set(runtime.id, new StoredTwinComponent(runtime, styledContext.get()));
  }
}
