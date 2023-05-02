import { hash } from '@universal-labs/twind-adapter';
import type { VirtualStyleSheet } from './VirtualStylesheet';

type Sheet = ReturnType<VirtualStyleSheet['injectUtilities']>;

export default class SheetsStore<T = Sheet> {
  private table: Map<string, T>;
  private static instance: SheetsStore;
  private constructor() {
    this.table = new Map();
  }

  static getInstance() {
    if (!SheetsStore.instance) {
      SheetsStore.instance = SheetsStore.createInstance();
    }
    return SheetsStore.instance;
  }

  static createInstance() {
    return new SheetsStore();
  }

  setStyle(generatedClassNames: string, value: T) {
    const index = hash(generatedClassNames);
    if (!this.table.get(index)) {
      this.table.set(index, value);
    }
    return index;
  }

  get(key: string) {
    const index = hash(key);
    return this.table.get(index);
  }
  getTable() {
    return this.table;
  }
}
