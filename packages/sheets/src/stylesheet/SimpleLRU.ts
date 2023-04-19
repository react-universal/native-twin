import type { AnyStyle } from '../types';

export default class SimpleLRU<T extends AnyStyle> {
  private cache: Map<string, T> = new Map();
  private previousCache: Map<string, T> = new Map();

  constructor(private size: number) {}

  static create(size: number) {
    return new SimpleLRU(size);
  }

  get(key: string) {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    if (this.previousCache.has(key)) {
      const value = this.previousCache.get(key)!;
      this.previousCache.delete(key);
      this.cache.set(key, value);
      return value;
    }
  }
  set(key: string, value: T) {
    this.cache.set(key, value);
    if (this.cache.size > 100) {
      this.previousCache.clear();
      this.previousCache = this.cache;
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  clear() {
    this.cache.clear();
  }
}
