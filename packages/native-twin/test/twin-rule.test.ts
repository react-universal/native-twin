import { describe, expect, it } from 'vitest';
import {
  createThemeContext,
  defineConfig,
  matchThemeColor,
  matchThemeValue,
  setup,
} from '../src/index.js';
import { TwinRule } from '../src/twin/rule.model.js';

const tw = setup(
  defineConfig({
    content: [],
    rules: [
      matchThemeColor('bg-', 'backgroundColor'),
      // @ts-ignore
      matchThemeValue('p', 'spacing', 'padding', {
        canBeNegative: true,
        feature: 'edges',
        prefix: 'padding',
      }),
      // @ts-ignore
      matchThemeValue('shadow-', 'boxShadow', 'shadowRadius'),
    ],
    theme: {
      screens: { md: '640px', sm: '740px' },
      colors: { primary: 'blue' },
      spacing: { 1: '1rem', 2: '2rem' },
      boxShadow: {
        sm: {
          shadowOffset: { width: 0, height: 1 },
          shadowColor: 'rgb(0,0,0)',
          shadowRadius: 3,
          shadowOpacity: 0.3,
          elevation: 1,
        },
      },
    },
  }),
);

describe('test twin rule model', () => {
  const twinRules = tw.config.rules.map((x) => new TwinRule(x));
  const context = createThemeContext(tw.config);
  it('test classname', () => {
    const result = twinRules.flatMap((rule) => {
      const parsed = rule.parse('bg-primary');
      if (parsed.isError) return [];
      const themeValue = tw.theme(rule.themeSection ?? '', parsed.result.segment.value);
      return { parsed, themeValue };
    });
    expect(result).toBeDefined();
  });
});
