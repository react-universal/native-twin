import { composeR } from './compose';
import type { Functor1 } from './Functor';
import * as List from './List';
import * as Option from './Option';

const mapOption = Option.functor.map;
const mapList = List.functor.map;

/**
 * @example
 * ```typescript
 *
// Manual Composition
const double = (x: number) => x * 2;
const output = composeR(mapList, mapOption)(double)(optionListData);
// Functor composition
const optionListData = Option.some(List.cons(1, List.cons(2, List.cons(3, List.nil))));
const output2 = optionListFunctor.map(double)(optionListData);
 *  ```
 */
export const optionListFunctor: Functor1<'OptionList'> = {
  URI: 'OptionList',
  map: composeR(mapList, mapOption),
};
