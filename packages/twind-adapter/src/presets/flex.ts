import type { TwindRule } from '@twind/core';

const flexRegex = /(flex*)-(\d)/g;

export default function flexToReactNative(rule: TwindRule) {
  const match = rule.n?.match(flexRegex);
  if (!!match && match.length > 0) {
    const [name, value] = match[0].split('-');
    rule.d = `${name}: ${value}`;
  }
  return {
    ...rule,
  };
}
