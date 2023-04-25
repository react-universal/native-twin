import type { Preset } from '@twind/core';
import valueParser from 'postcss-value-parser';

export default function presetCalc(): Preset {
  return {
    finalize(rule, context) {
      // const transformed = valueParser(rule.);
      console.log('RULE: ', rule);
      console.log('CONTEXT: ', context);
      return rule;
    },
  };
}
