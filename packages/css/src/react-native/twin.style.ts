import type { AnyDeclarationValue } from './declarations/declaration.value';
import type { AnyDeclaration } from './declarations/style.declaration';

export interface TwinStyleSuccess<A> {
  readonly _tag: 'success';
  style: {
    prop: string;
    value: A;
  };
}
export interface TwinStyleRuntime {
  readonly _tag: 'runtime';
  decl: AnyDeclaration;
  prop: string;
  value: AnyDeclarationValue;
}
export interface TwinStyleFail {
  readonly _tag: 'fail';
  decl: AnyDeclaration;
  reason: string;
}
/** @category Tagged Types */
export type TwinStyleResult<A> = TwinStyleSuccess<A> | TwinStyleRuntime | TwinStyleFail;

/** @category Tagged Types */
export const TwinStyleResult = {
  $is:
    <A>(tag: TwinStyleResult<A>['_tag']) =>
    (x: TwinStyleResult<A>) =>
      x._tag === tag,
  success: <A>(prop: string, value: A): TwinStyleSuccess<A> => ({
    _tag: 'success',
    style: { prop, value },
  }),
  runtime: (decl: AnyDeclaration, value: AnyDeclarationValue): TwinStyleRuntime => ({
    _tag: 'runtime',
    decl,
    value,
    prop: decl.prop,
  }),
  fail: (decl: AnyDeclaration, reason: string): TwinStyleFail => ({ _tag: 'fail', decl, reason }),
};
