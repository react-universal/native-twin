import type { TwindRule } from '@twind/core';

export default function convertCalc(rule: TwindRule) {
  if (rule.d && rule.d?.includes('calc')) {
    rule.d = rule.d.replace(
      /calc\(([\w-]+)\s*([*/+\\-])\s*([\w-]+)\)/g,
      (match, p1, p2, p3) => {
        const valueLeft = parseInt(p1);
        const operator = p2;
        const valueRight = parseInt(p3);
        if (valueLeft && operator && valueRight) {
          if (operator === '*') {
            return `${valueLeft * valueRight}px`;
          }
          if (operator === '+') {
            return `${valueLeft + valueRight}px`;
          }
          if (operator === '/') {
            return `${valueLeft / valueRight}px`;
          }
          if (operator === '-') {
            return `${valueLeft - valueRight}px`;
          }
        }
        return match;
      },
    );
  }
  return rule;
}
