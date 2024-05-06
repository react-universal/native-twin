import * as Equivalence from 'effect/Equivalence';
import * as Order from 'effect/Order';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';

export const orderCompletions = Order.mapInput(
  Order.number,
  (x: TwinRuleWithCompletion) => x.order,
);

export const eqTwinRuleWithCompletion = Equivalence.mapInput(
  (x: TwinRuleWithCompletion) => x.completion.className,
)(Equivalence.string);
