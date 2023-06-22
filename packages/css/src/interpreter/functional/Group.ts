import type { MonoID } from './MonoID';

export interface Group<A> extends MonoID<A> {
  inverse: (a: A) => A;
}

/**
 * Group: is a monoID that each value has a unique inverse
 * Group: is fundamental structure in Maths
 * Group: encodes the concept of symmetry
 */
