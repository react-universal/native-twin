import * as Order from 'effect/Order';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';

export const orderCompletions = Order.mapInput(
  Order.number,
  (x: TwinRuleWithCompletion) => x.order,
);
// Order.make(
//   (a: TwinRuleWithCompletion, b: TwinRuleWithCompletion) => (a.order < b.order ? 1 : -1),
// );
