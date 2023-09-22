import { cornerMap, directionMap } from '@universal-labs/css/tailwind';
import {
  Rule,
  RuleMeta,
  __Theme__,
  asArray,
  createTailwind,
  createThemeContext,
  defineConfig,
} from '@universal-labs/native-tailwind';
import { ClassCompletionItem, VariantCompletionItem } from '../types';

export function createIntellisense() {
  // const cssCache = new Map<string, string>();
  const classes: Map<string, ClassCompletionItem> = new Map();
  const variants: Map<string, VariantCompletionItem> = new Map();
  const config = defineConfig({});
  const tw = createTailwind(config);
  const context = createThemeContext(config);
  let nextIndex = 0;
  for (const variant in { ...tw.config.theme.screens, ...tw.config.theme.extend?.screens }) {
    const location = {
      index: nextIndex++,
      position: variants.size,
    };
    variants.set(variant, {
      kind: 'variant',
      name: `${variant}:`,
      ...location,
    });
  }
  for (const rule of tw.config.rules) {
    const { isColor, getExpansions, themeSection, location, property, meta, values } =
      getRuleData(rule);
    for (const suffix in isColor ? context.colors : (values as Record<string, string>)) {
      for (const className of getExpansions(suffix)) {
        const themeValue = tw.theme(themeSection, suffix);
        if (!themeValue) continue;
        if (isColor && typeof themeValue == 'object') continue;
        if (!className.includes('DEFAULT')) {
          classes.set(className, {
            canBeNegative: !!meta.canBeNegative,
            isColor: isColor,
            kind: 'class',
            name: className,
            themeValue,
            themeSection,
            property,
            ...location,
          });
        }
      }
    }
  }
  return {
    classes,
    context,
    tw,
  };

  function getRuleData(rule: Rule<__Theme__>) {
    const location = {
      index: nextIndex++,
      position: classes.size,
    };
    const basePattern = rule[0];
    let meta: RuleMeta = {
      canBeNegative: false,
      feature: 'default',
    };
    let themeSection: string = '';
    let property = '';
    if (typeof rule[2] == 'object') meta = rule[2];
    if (typeof rule[3] == 'object') meta = rule[3];
    if (typeof rule[1] == 'string') themeSection = rule[1];
    if (typeof rule[2] == 'string') themeSection = rule[2];
    property = themeSection;
    if (/color|fill|stroke/i.test(themeSection)) {
      themeSection = 'colors';
    }
    const result = {
      themeSection,
      meta,
      location,
      basePattern,
      isColor: themeSection == 'colors',
      property,
      values: config.theme[themeSection as keyof typeof config.theme],
      getExpansions(suffix: string) {
        const composer = composeClassName(basePattern);
        if (meta.feature == 'edges') {
          return Object.keys(directionMap).map((x) => composer(composeExpansion(x) + suffix));
        }
        if (meta.feature == 'corners') {
          return Object.keys(cornerMap).map((x) => composer(composeExpansion(x) + suffix));
        }
        return asArray(composer(suffix));
      },
    };
    return result;
  }
}

const composeClassName = (pattern: string) => (suffix: string) => {
  if (pattern.endsWith('-')) {
    return `${pattern}${suffix}`;
  }
  return suffix;
};

const composeExpansion = (expansion: string) => {
  if (!expansion || expansion == '') {
    return expansion;
  }
  return `${expansion}-`;
};

export type CreateIntellisenseFn = ReturnType<typeof createIntellisense>;
