import type { MonoID } from './functional/MonoID';

export interface CssNodeMonad<A> {
  map: <B>(f: (a: A) => B) => CssNodeMonad<B>;
  flatMap: <B>(f: (a: A) => B) => B;
}

export const CssAstOf = <A>(node: A): CssNodeMonad<A> => ({
  map: (f) => CssAstOf(f(node)),
  flatMap: (f) => f(node),
});

interface DeclarationsSemiGroup<A> extends MonoID<A> {}

export const declarationsSemiGroup: DeclarationsSemiGroup<any> = {
  concat: (x) => x,
  empty: {},
};
