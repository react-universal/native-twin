export interface Order<in A> {
  (self: A, that: A): -1 | 0 | 1
}

export const make = <A>(
  compare: (self: A, that: A) => -1 | 0 | 1
): Order<A> =>
  (self, that) => self === that ? 0 : compare(self, that)