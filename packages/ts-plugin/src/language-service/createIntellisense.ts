import { cornerMap, directionMap } from '@universal-labs/css/tailwind';
import {
  Rule,
  RuleMeta,
  RuntimeTW,
  TailwindConfig,
  ThemeContext,
  __Theme__,
  asArray,
  createTailwind,
  createThemeContext,
  defineConfig,
  flattenThemeSection,
} from '@universal-labs/native-tailwind';
import { ClassCompletionToken, VariantCompletionToken } from '../types';
import { ConfigurationManager } from './configuration';
import { LanguageServiceLogger } from './logger';

export class NativeTailwindIntellisense {
  logger: LanguageServiceLogger;
  pluginConfig: ConfigurationManager;
  private _classes: Map<string, ClassCompletionToken> = new Map();
  private _variants: Map<string, VariantCompletionToken> = new Map();
  tailwindConfig: TailwindConfig;
  tw: RuntimeTW;
  context: ThemeContext;
  nextIndex = 0;

  constructor(logger: LanguageServiceLogger, pluginConfig: ConfigurationManager) {
    this.pluginConfig = pluginConfig;
    this.logger = logger;
    this.tailwindConfig = defineConfig({});
    this.tw = createTailwind(this.tailwindConfig);
    this.context = createThemeContext(this.tailwindConfig);
    this.completions = this.completions.bind(this);
  }

  completions() {
    if (this._variants.size == 0) {
      this.fillVariants();
    }
    if (this._classes.size == 0) {
      this.fillClasses();
    }
    return {
      classes: this._classes,
      variants: this._variants,
      screens: new Set(this._variants.keys()),
    };
  }
  private fillClasses() {
    for (const rule of this.tw.config.rules) {
      const { isColor, getExpansions, themeSection, location, property, meta, values } =
        this.getRuleData(rule);
      for (const suffix in isColor
        ? this.context.colors
        : (values as Record<string, string>)) {
        for (const className of getExpansions(suffix)) {
          const themeValue = this.tw.theme(themeSection, suffix);
          if (!themeValue) continue;
          if (isColor && typeof themeValue == 'object') continue;
          if (!className.includes('DEFAULT')) {
            this._classes.set(className, {
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
  }
  private fillVariants() {
    if (this._variants.size) return this._variants;
    for (const variant in {
      ...this.tw.config.theme.screens,
      ...this.tw.config.theme.extend?.screens,
    }) {
      const location = {
        index: this.nextIndex++,
        position: this._variants.size,
      };
      this._variants.set(variant, {
        kind: 'variant',
        name: `${variant}:`,
        ...location,
      });
    }
    return this._variants;
  }

  getRuleData(rule: Rule<__Theme__>) {
    const location = {
      index: this.nextIndex++,
      position: this._classes.size,
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
      values: flattenThemeSection(
        this.tailwindConfig.theme[themeSection as keyof typeof this.tailwindConfig.theme],
      ),
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
  if (suffix == pattern) return pattern;
  if (pattern.includes('|')) return suffix;
  return pattern + suffix;
};

const composeExpansion = (expansion: string) => {
  if (!expansion || expansion == '') {
    return expansion;
  }
  return `${expansion}-`;
};
