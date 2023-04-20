import type { Preset } from '@twind/core';

const flexRegex = /(flex*)-(\d)/g;

export default function presetReactNativeFlex(): Preset {
  return {
    finalize(rule) {
      const match = rule.n?.match(flexRegex);
      if (!!match && match.length > 0) {
        const [name, value] = match[0].split('-');
        rule.d = `${name}: ${value}`;
      }
      return {
        ...rule,
      };
    },
  };
}
