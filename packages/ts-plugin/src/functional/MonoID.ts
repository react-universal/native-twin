import type { SemiGroup } from './SemiGroup';

// import { cons, List, nil } from './List';
// import { matchList } from './patternMatch';

export interface MonoID<A> extends SemiGroup<A> {
  empty: A;
}
