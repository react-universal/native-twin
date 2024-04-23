import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { Rule, RuleMeta } from '@native-twin/core';
import {
  CompleteStyle,
  cornerMap,
  directionMap,
  TWScreenValueConfig,
} from '@native-twin/css';
import { ColorsRecord, asArray } from '@native-twin/helpers';
import { InternalTwinConfig } from '../plugin/nativeTwin.config';

export type InternalNativeTwinRule = Rule<InternalTwinConfig['theme']>;

export class TwinRuleWithCompletion {
  constructor(
    readonly twinRule: RuleInfo,
    readonly completion: {
      className: string;
      declarations: string[];
      declarationValue: string;
    },
  ) {}
}

export class RuleInfo implements Equal.Equal {
  private readonly pattern: string;
  readonly property: InternalNativeTwinRule[1] | keyof CompleteStyle | (string & {});
  readonly themeSection: InternalNativeTwinRule[1] | (string & {});
  readonly resolver: InternalNativeTwinRule[2];
  readonly meta: RuleMeta;

  constructor(rule: InternalNativeTwinRule) {
    this.pattern = rule[0];
    this.resolver = rule[2];
    this.meta = rule[3] ?? RuleInfo.defaultRuleMeta;
    if (this.meta.styleProperty) {
      this.themeSection = rule[1];
      this.property = this.meta.styleProperty;
    } else if (this.meta.prefix && this.meta.prefix !== '') {
      this.property = this.meta.prefix;
      this.themeSection = rule[1];
    } else {
      this.themeSection = rule[1];
      this.property = rule[1];
    }
  }

  get compositions() {
    return createCompositions(this.pattern, this.meta);
  }

  createClassNames(values: Record<string, TWScreenValueConfig> | ColorsRecord) {
    return createRuleClassNames(values, this.compositions, this.meta, this.property);
  }

  private static get defaultRuleMeta(): RuleMeta {
    return {
      prefix: '',
      styleProperty: undefined,
      suffix: '',
      support: [],
      canBeNegative: false,
      feature: 'default',
    };
  }

  [Hash.symbol](): number {
    const combine = Hash.combine(Hash.string(`${this.pattern}-${this.property}`));
    return combine(Hash.structure(this.meta));
  }

  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof RuleInfo &&
      Equal.equals(this.pattern, that.pattern) &&
      Equal.equals(this.property, that.property) &&
      Equal.equals(this.themeSection, that.themeSection)
    );
  }
}

export const createRuleComposer = (ruleInfo: {
  pattern: string;
  feature: RuleMeta['feature'];
}) => {
  const composer = composeClassName(ruleInfo.pattern);
  let mapper: Record<string, string[]> = {};

  if (ruleInfo.feature === 'edges') {
    mapper = directionMap;
  }
  if (ruleInfo.feature === 'corners') {
    mapper = cornerMap;
  }

  const suffixes = Object.entries(mapper).flatMap((x) => {
    return {
      classNameSuffix: x[0],
      declarationSuffixes: x[1],
    };
  });

  return {
    suffixes,
    expansions: suffixes.map((x) => {
      const classNameExpansion = composeExpansion(x.classNameSuffix).replace('--', '-');
      // const declarationExpansions = x.declarationSuffixes.map((y) => ``);
      const composed = composer(classNameExpansion);
      return {
        classNameExpansion,
        composed,
      };
    }),
  };
};

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
    return `-${expansion}`;
  }
  return `${expansion}-`;
};

const createCompositions = (pattern: string, meta: RuleInfo['meta']) => {
  const composer = composeClassName(pattern);
  let mapper: Record<string, string[]> = {};

  if (meta.feature === 'edges') {
    mapper = directionMap;
  }
  if (meta.feature === 'corners') {
    mapper = cornerMap;
  }
  if (meta.feature === 'default') {
    return asArray({
      composed: pattern,
      classNameExpansion: '',
      classNameSuffix: meta.suffix ?? '',
      declarationSuffixes: [meta.suffix ?? ''],
    });
  }

  const suffixes = Object.entries(mapper).flatMap((x) => {
    const classNameExpansion = composeExpansion(x[0]).replace('--', '-');
    const composed = composer(classNameExpansion);
    return {
      composed,
      classNameExpansion,
      classNameSuffix: x[0],
      declarationSuffixes: x[1],
    };
  });

  return suffixes;
};

const createRuleClassNames = (
  values: Record<string, TWScreenValueConfig> | ColorsRecord,
  compositions: RuleInfo['compositions'],
  meta: RuleInfo['meta'],
  property: RuleInfo['property'],
) => {
  const result: {
    className: string;
    declarations: string[];
    declarationValue: string;
  }[] = [];
  for (const key in values) {
    if (key.includes('DEFAULT')) continue;
    const parts = compositions.map((x) => ({
      className: `${x.composed}${key}`.replace('--', '-'),
      declarations: x.declarationSuffixes.map((x) => `${property ?? ''}${x}`),
      declarationValue: values[key] as string,
    }));
    result.push(...parts);
    if (meta.canBeNegative) {
      result.push(
        ...parts.map((x) => ({
          ...x,
          declarationValue: `-${values[key]}`,
          className: `-${x.className}`,
        })),
      );
    }
  }

  return result;
};
