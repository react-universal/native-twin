import * as Equivalence from 'effect/Equivalence';
import * as Order from 'effect/Order';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../../types/native-twin.types';

export const orderCompletions = Order.mapInput(
  Order.number,
  (x: TwinRuleWithCompletion) => x.order,
);

export const orderVariantsCompletions = Order.mapInput(
  Order.number,
  (x: TwinVariantCompletion) => x.position,
);

export const eqTwinRuleWithCompletion = Equivalence.mapInput(
  (x: TwinRuleWithCompletion) => x.completion.className,
)(Equivalence.string);

export const eqTwinVariantWithCompletion = Equivalence.mapInput(
  (x: TwinVariantCompletion) => x.position,
)(Equivalence.number);
