export const eqSymbol: unique symbol = Symbol.for('__Equality');

export const hashSymbol: unique symbol = Symbol.for("__Hash");

export interface Hash {
  [hashSymbol]: number;
}

export interface Equal extends Hash {
  [eqSymbol](that: Equal): boolean
}
