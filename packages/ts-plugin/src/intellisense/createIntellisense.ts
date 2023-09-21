import { cornerMap, directionMap } from '@universal-labs/css/tailwind';
import {
  Rule,
  RuleMeta,
  RuleResolver,
  __Theme__,
  asArray,
  createTailwind,
  createThemeContext,
  defineConfig,
} from '@universal-labs/native-tailwind';
import { CompletionItem } from '../types';

export function createIntellisense() {
  // const cssCache = new Map<string, string>();
  const suggestions: Map<string, CompletionItem> = new Map();
  const config = defineConfig({});
  const tw = createTailwind(config);
  const context = createThemeContext(config);
  let nextIndex = 0;
  for (const rule of tw.config.rules) {
    const { isColor, getExpansions, location, meta, values } = getRuleData(rule);
    for (const suffix in isColor ? context.colors : (values as Record<string, string>)) {
      for (const className of getExpansions(suffix)) {
        if (!className.includes('DEFAULT')) {
          suggestions.set(className, {
            canBeNegative: !!meta.canBeNegative,
            isColor: isColor,
            kind: 'class',
            name: className,
            theme: tw(className),
            ...location,
          });
        }
      }
    }
  }
  // for (const variant of tw.config.variants) {
  //   console.log('VV: ', variant);
  // }
  return {
    getCss,
    classes: suggestions,
  };

  function getRuleData(rule: Rule<__Theme__>) {
    const location = {
      index: nextIndex++,
      position: 0,
    };
    const basePattern = rule[0];
    let resolver: RuleResolver<__Theme__> | undefined;
    let meta: RuleMeta = {
      canBeNegative: false,
      feature: 'default',
    };
    let themeSection: string = '';
    if (typeof rule[1] == 'function') {
      resolver = rule[1];
    }
    if (typeof rule[2] == 'function') {
      resolver = rule[2];
    }
    if (typeof rule[2] == 'object') meta = rule[2];
    if (typeof rule[3] == 'object') meta = rule[3];
    if (typeof rule[1] == 'string') themeSection = rule[1];
    if (typeof rule[2] == 'string') themeSection = rule[2];
    if (/color|fill|stroke/i.test(themeSection)) themeSection = 'colors';
    const result = {
      themeSection,
      resolver,
      meta,
      location,
      basePattern,
      isColor: themeSection == 'colors',
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

  function getCss(name: string) {
    const sheet = tw(name)!;
    return {
      className: name,
      sheet,
      css: '',
    };
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
