import type { RuleMeta } from '@native-twin/core';
import { type CompleteStyle, cornerMap, directionMap } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { Array, pipe } from 'effect';
import type {
  AnyInternalTwinRule,
  InternalNativeTwinRule,
} from '../../models/twin/native-twin.types';
import { DEFAULT_RULE_META } from '../../utils/constants.utils';
import type { TwinRuleComposition, TwinRuleRegistry } from './TwinParser.models';

export class TwinRuleComposer {
  private readonly rawRule: AnyInternalTwinRule;
  private _compositions: TwinRuleComposition[] | null = null;
  private featureMapper: Record<string, string[]>;

  readonly styleProperty: InternalNativeTwinRule[1] | keyof CompleteStyle | (string & {});
  readonly themeSection: InternalNativeTwinRule[1] | (string & {});

  get meta() {
    return this.rawRule[3] ?? DEFAULT_RULE_META;
  }
  get pattern() {
    return this.rawRule[0];
  }

  get suffix() {
    return this.meta.suffix ?? '';
  }

  get compositions() {
    if (this._compositions !== null) return this._compositions;
    if (this.meta.feature === 'default') {
      this._compositions = asArray({
        composed: this.pattern,
        classNameExpansion: '',
        classNameSuffix: this.meta.suffix ?? '',
        declarationSuffixes: [this.meta.suffix ?? ''],
      });
      return this._compositions;
    }
    this._compositions = Object.entries(this.featureMapper).flatMap((x) => {
      const classNameExpansion = composeExpansion(x[0]).replace('--', '-');
      const composed = this.classNameComposer(classNameExpansion).replace('--', '-');
      if (composed.includes('--')) {
        console.debug('Found rare className: ', composed);
      }
      return {
        composed,
        classNameExpansion,
        classNameSuffix: x[0],
        declarationSuffixes: x[1],
      };
    });
    return this._compositions;
  }

  constructor(rawRule: AnyInternalTwinRule) {
    this.rawRule = rawRule;
    if (this.meta.styleProperty) {
      this.themeSection = this.rawRule[1];
      this.styleProperty = this.meta.styleProperty;
    } else if (this.meta.prefix && this.meta.prefix !== '') {
      this.styleProperty = this.meta.prefix;
      this.themeSection = this.rawRule[1];
    } else {
      this.themeSection = this.rawRule[1];
      this.styleProperty = this.rawRule[1];
    }
    this.featureMapper = getRuleMapper(this.meta);
  }

  createClassNamesCollection(compositionIndex: number, themeConfig: Record<string, any>) {
    const composition = this.compositions[compositionIndex];
    if (!composition) throw new Error('Must provide a valid composition index');
    return pipe(
      Array.Do,
      Array.bind('value', () => Object.entries(themeConfig)),
      Array.let('className', ({ value: [key] }) =>
        `${composition.composed}${key}`.replace('--', '-'),
      ),
      Array.let('declarations', () =>
        composition.declarationSuffixes.map(
          (x) => `${String(this.styleProperty ?? '')}${x}${this.suffix ?? ''}`,
        ),
      ),
      Array.let('declarationValue', ({ value: [_, value] }) => value as string),
      Array.flatMap((data): TwinRuleRegistry[] => {
        if (!this.meta.canBeNegative) {
          return [data];
        }
        return [
          data,
          {
            ...data,
            className: `-${data.className}`,
            declarationValue: `-${data.declarationValue}`,
          },
        ];
      }),
    );
  }

  private classNameComposer(suffix: string) {
    if (this.pattern.endsWith('-')) {
      return `${this.pattern}${suffix}`;
    }
    if (suffix === this.pattern) return this.pattern;
    if (this.pattern.includes('|')) return suffix;
    return this.pattern + suffix;
  }
}

const getRuleMapper = (meta: RuleMeta): Record<string, string[]> => {
  if (meta.feature === 'edges') {
    return directionMap;
  }
  if (meta.feature === 'corners') {
    return cornerMap;
  }
  if (meta.feature === 'transform-2d') {
    return { x: directionMap.x, y: directionMap.y };
  }
  if (meta.feature === 'transform-3d') {
    return { x: directionMap.x, y: directionMap.y, z: directionMap.x };
  }
  return {};
};

const composeExpansion = (expansion: string) => {
  if (!expansion || expansion === '') {
    return `-${expansion}`;
  }
  return `${expansion}-`;
};
