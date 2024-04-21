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
// import { asArray } from '@native-twin/helpers';
import { InternalTwinConfig } from '../intellisense/intellisense.config';

type InternalRule = Rule<InternalTwinConfig['theme']>;
// type RuleInfo = ReturnType<typeof getRuleInfo>;

export class RuleInfo implements Equal.Equal {
  readonly pattern: string;
  readonly property: InternalRule[1] | keyof CompleteStyle | (string & {});
  readonly themeSection: InternalRule[1] | (string & {});
  readonly resolver: InternalRule[2];
  readonly meta: RuleMeta;

  constructor(readonly rule: InternalRule) {
    this.pattern = rule[0];
    this.resolver = rule[2];
    this.meta = rule[3] ?? this.defaultRuleMeta;
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
    const composer = composeClassName(this.pattern);
    let mapper: Record<string, string[]> = {};

    if (this.meta.feature === 'edges') {
      mapper = directionMap;
    }
    if (this.meta.feature === 'corners') {
      mapper = cornerMap;
    }
    if (this.meta.feature === 'default') {
      return asArray({
        composed: this.pattern,
        classNameExpansion: '',
        classNameSuffix: '',
        declarationSuffixes: [''],
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
  }

  createClassNames(values: Record<string, TWScreenValueConfig> | ColorsRecord) {
    const result: {
      className: string;
      declarations: string[];
      declarationValue: string;
    }[] = [];
    for (const key in values) {
      if (key.includes('DEFAULT')) continue;
      const parts = this.compositions.map((x) => ({
        className: `${x.composed}${key}`.replace('--', '-'),
        declarations: x.declarationSuffixes.map((x) => `${this.property ?? ''}${x}`),
        declarationValue: values[key] as string,
      }));
      result.push(...parts);
      if (this.meta.canBeNegative) {
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
  }

  private get defaultRuleMeta(): RuleMeta {
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
    if (that instanceof RuleInfo) {
      return (
        Equal.equals(this.pattern, that.pattern) &&
        Equal.equals(this.property, that.property)
      );
    }

    return false;
  }
}

export const getRuleInfo = (rule: InternalRule) => {
  return new RuleInfo(rule);
  // let meta: RuleMeta = {
  //   prefix: '',
  //   styleProperty: undefined,
  //   suffix: '',
  //   support: [],
  //   canBeNegative: false,
  //   feature: 'default',
  // };

  // if (typeof rule[3] === 'object') {
  //   meta = rule[3];
  // }

  // const ruleInfo = {
  //   pattern: rule[0],
  //   property: rule[1],
  //   resolver: rule[2],
  //   meta: meta,
  // };

  // return {
  //   ...ruleInfo,
  //   compositions: createRuleComposer({
  //     feature: ruleInfo.meta.feature,
  //     pattern: ruleInfo.pattern,
  //   }),
  // };
};

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
