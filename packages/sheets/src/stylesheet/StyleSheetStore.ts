export default class StyleSheetStore<T> {
  private cache: Map<string, T> = new Map();
  private previousCache: Map<string, T> = new Map();

  constructor(private size: number) {}

  static create<T>(size: number) {
    return new StyleSheetStore<T>(size);
  }

  get(key: string) {
    if (this.previousCache.has(key)) {
      const value = this.previousCache.get(key)!;
      this.previousCache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return this.cache.get(key)!;
  }
  set(key: string, value: T) {
    this.cache.set(key, value);
    if (this.cache.size > this.size) {
      this.previousCache.clear();
      this.previousCache = this.cache;
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  clear() {
    this.cache.clear();
  }

  print() {
    return this.cache;
  }
}
