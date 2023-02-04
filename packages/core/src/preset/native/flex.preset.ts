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
      // console.log('RULE: ', rule);
      // return {
      //   ...rule,
      //   d: rule.d?.replace(/(var\(--tw-bg-opacity\))/g, (match, p1) => {
      //     console.log('RULE_D: ', match, p1);
      //     if (p1 === undefined) return match;
      //     return '0.5';
      //   }),
      // };
    },
  };
}
