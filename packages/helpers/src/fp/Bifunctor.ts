import type { HKT2, Kind, Kind2, URIS, URIS2 } from './HKT';

export interface Bifunctor<F> {
  URI: F;
  bimap: <A, B, C, D>(f: (a: A) => C, g: (b: B) => D) => (fab: HKT2<F, A, B>) => HKT2<F, C, D>;
}

export interface Bifunctor1<F extends URIS> {
  URI: F;
  bimap: <A, B>(f: (a: A) => B) => (fab: Kind<F, A>) => Kind<F, B>;
  // map: <A, B>(f: (x: A) => B) => (fa: Kind<F, A>) => Kind<F, B>;
}

export interface Bifunctor2<F extends URIS2> {
  URI: F;
  bimap: <A, B, C, D>(f: (a: A) => C, g: (b: B) => D) => (fab: Kind2<F, A, B>) => Kind2<F, C, D>;
}
