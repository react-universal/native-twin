import * as Equivalence from 'effect/Equivalence';
import * as Order from 'effect/Order';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../../types/native-twin.types';
import { TemplateTokenData } from '../language.models';

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

export const compareTwinRuleWithClassName =
  (twinRule: TwinRuleWithCompletion) => (data: string[]) => {
    const { completion } = twinRule;
    return data.some((x) => completion.className.startsWith(x));
  };

export const getClassNameFromTokenData = (templateNode: TemplateTokenData) => {
  const { token: node, base } = templateNode;

  let nodeText = node.text;
  let baseText = '';
  if (base) {
    if (base.token.type === 'CLASS_NAME') {
      if (!nodeText.startsWith(base.token.value.n)) {
        baseText = `${base.token.value.n}-`;
      }
    }
    if (base.token.type === 'VARIANT_CLASS') {
      baseText = `${base.token.value[1].value.n}-`;
    }
  }

  if (node.token.type === 'VARIANT_CLASS') {
    nodeText = `${node.token.value[1].value.n}`;
  }

  return `${baseText}${nodeText}`;
};
