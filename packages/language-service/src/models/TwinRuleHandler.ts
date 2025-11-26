import type { RuleMeta } from '@native-twin/core';
import { type CompleteStyle, cornerMap, directionMap } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import type { AnyInternalTwinRule } from '../internal/TwinTypes.internal';
import { type TwinRuleComposition, TwinRuleRegistry } from './TwinParser.models';

export interface TwinRuleComposerInfo {
  readonly styleProperty: AnyInternalTwinRule[1] | keyof CompleteStyle | (string & {});
  readonly themeSection: AnyInternalTwinRule[1] | (string & {});
  readonly meta: RuleMeta;
}
export class TwinRuleComposer {
  private readonly rawRule: AnyInternalTwinRule;
  private _fullRules: TwinRuleRegistry[] | null = null;
  private _compositions: TwinRuleComposition[] | null = null;
  private featureMapper: Record<string, string[]>;
  readonly info: TwinRuleComposerInfo;

  get pattern() {
    return this.rawRule[0];
  }

  get suffix() {
    return this.info.meta.suffix ?? '';
  }

  get compositions() {
    if (this._compositions) return this._compositions;
    if (this.info.meta.feature === 'default') {
      this._compositions = asArray({
        composed: this.pattern,
        classNameExpansion: '',
        classNameSuffix: this.info.meta.suffix ?? '',
        declarationSuffixes: [this.info.meta.suffix ?? ''],
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

  constructor(
    { rawRule, info }: { rawRule: AnyInternalTwinRule; info: TwinRuleComposerInfo },
    readonly resolvedSection: Record<string, any>,
  ) {
    this.rawRule = rawRule;
    this.info = info;
    this.featureMapper = getRuleMapper(this.info.meta);
  }

  evaluateText(text: string) {
    if (!text.startsWith(this.pattern)) return [];
    return this.toFullRules().filter((rule) => rule.className.startsWith(text));
  }

  toFullRules() {
    if (this._fullRules) return this._fullRules;

    const results: TwinRuleRegistry[] = [];
    for (const key in this.resolvedSection) {
      const declarationValue = this.resolvedSection[key];
      for (const composition of this.compositions) {
        const className = `${composition.composed}${key}`.replace('--', '-');
        if (className.endsWith('DEFAULT')) continue;
        const declarations = composition.declarationSuffixes.map(
          (x) => `${String(this.info.styleProperty ?? '')}${x}${this.suffix ?? ''}`,
        );
        results.push(
          new TwinRuleRegistry({ className, declarations, declarationValue }, composition, this),
        );
        if (this.info.meta.canBeNegative) {
          results.push(
            new TwinRuleRegistry(
              {
                declarations,
                className: `-${className}`,
                declarationValue: `-${declarationValue}`,
              },
              composition,
              this,
            ),
          );
        }
      }
    }
    this._fullRules = results;
    return this._fullRules;
  }

  createClassNamesCollection(compositionIndex: number) {
    const composition = this.compositions[compositionIndex];
    if (!composition) throw new Error('Must provide a valid composition index');
    return pipe(
      RA.Do,
      RA.bind('value', () => Object.entries(this.resolvedSection)),
      RA.let('className', ({ value: [key] }) => `${composition.composed}${key}`.replace('--', '-')),
      RA.let('declarations', () =>
        composition.declarationSuffixes.map(
          (x) => `${String(this.info.styleProperty ?? '')}${x}${this.suffix ?? ''}`,
        ),
      ),
      RA.let('declarationValue', ({ value: [_, value] }) => value as string),
      RA.flatMap((data): TwinRuleRegistry[] => {
        const registry = new TwinRuleRegistry(data, composition, this);
        if (data.className.endsWith('DEFAULT')) return [];
        if (!this.info.meta.canBeNegative) {
          return [registry];
        }
        return [
          registry,
          new TwinRuleRegistry(
            {
              ...data,
              className: `-${data.className}`,
              declarationValue: `-${data.declarationValue}`,
            },
            composition,
            this,
          ),
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
