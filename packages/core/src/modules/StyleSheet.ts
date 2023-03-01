import type { IStyleTuple } from '../types/styles.types';

class TailwindStyleSheet {
  size = 500;
  table = Array(this.size);

  put(key: number, value: string) {
    const hash = this._hashString(value);
    console.log('HASH: ', hash);
    this.table[key % this.size] = value;
  }

  get(key: number) {
    return this.table[key % this.size];
  }

  _hashString(key: string) {
    let hash = 0;
    let character: number;
    if (key.length === 0) return hash;
    for (let i = 0; i < key.length; i++) {
      character = key.charCodeAt(i);
      hash = (hash << 5) - hash + character;
      hash |= 0;
    }
    return hash;
  }
}

export { TailwindStyleSheet };
