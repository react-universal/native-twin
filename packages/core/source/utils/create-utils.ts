import * as css from 'css';
import cssToReactNative, { StyleTuple } from 'css-to-react-native';
import { Utilities } from '../types/utils.types';

const emToPx = (value: string, base: number) => Number.parseFloat(value) * base;
const remToPx = (value: string) => `${emToPx(value, 16)}px`;

const getStyle = (rule: css.Rule) => {
  const declarations = rule.declarations as Array<Required<css.Declaration>>;

  const properties: StyleTuple[] = declarations
    .filter(({ property }) => property !== 'transform')
    .map(({ property, value }) => {
      if (typeof value === 'string' && value.endsWith('rem')) {
        return [property, remToPx(value)];
      }

      return [property, value];
    });

  return cssToReactNative(properties);
};

const build = (source: string) => {
  const { stylesheet } = css.parse(source);

  // Mapping of Tailwind class names to React Native styles
  const utilities: Utilities = {};

  if (!stylesheet) {
    return utilities;
  }

  const addRule = (rule: css.Rule, media?: string) => {
    if (!Array.isArray(rule.selectors)) {
      return;
    }

    for (const selector of rule.selectors) {
      const utility = selector.replace(/^\./, '').replace(/\\/g, '');

      utilities[utility] = {
        style: getStyle(rule),
        media,
      };
    }
  };

  for (const rule of stylesheet.rules) {
    if (rule.type === 'rule') {
      addRule(rule);
    }

    if (rule.type === 'media') {
      const mediaRule = rule as Required<css.Media>;

      for (const childRule of mediaRule.rules) {
        if (childRule.type === 'rule') {
          addRule(childRule, mediaRule.media);
        }
      }
    }
  }

  return utilities;
};

export default build;
