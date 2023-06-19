import type { CssAstNode } from '../types';

export interface CssNodeMonad<A extends CssAstNode> {
  map: <B extends CssAstNode>(f: (a: A) => B) => CssNodeMonad<B>;
  flatMap: <B extends CssAstNode>(f: (a: A) => B) => B;
}

export const CssAstOf = <A extends CssAstNode>(node: A): CssNodeMonad<A> => ({
  map: (f) => CssAstOf(f(node)),
  flatMap: (f) => f(node),
});
