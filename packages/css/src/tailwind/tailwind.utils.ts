import { MaybeArray, asArray } from '@native-twin/helpers';
import { SelectorGroup } from '../css/css.types';
import { TWScreenValueConfig } from './tailwind.types';

export function getRuleSelectorGroup(variants: string[]): SelectorGroup {
  if (variants.length == 0) return 'base';
  if (
    variants.includes('group') ||
    variants.includes('group-hover') ||
    variants.includes('group-active') ||
    variants.includes('group-focus')
  )
    return 'group';
  if (variants.includes('odd')) return 'odd';
  if (variants.includes('even')) return 'even';
  if (variants.includes('first')) return 'first';
  if (variants.includes('last')) return 'last';
  if (variants.includes('hover') || variants.includes('focus') || variants.includes('active'))
    return 'pointer';
  return 'base';
}

export function mql(screen: MaybeArray<TWScreenValueConfig>, prefix = '@media '): string {
  // if (!screen) return '';
  return (
    prefix +
    asArray(screen)
      .map((screen) => {
        if (typeof screen == 'string') {
          screen = { min: screen };
        }

        return (
          (screen as { raw?: string }).raw ||
          Object.keys(screen)
            .map(
              (feature) => `(${feature}-width:${(screen as Record<string, string>)[feature]})`,
            )
            .join(' and ')
        );
      })
      .join(',')
  );
}
