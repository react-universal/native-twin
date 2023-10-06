import type { SelectorGroup } from '@universal-labs/css';
import type { ParsedRule } from '../types/tailwind.types';
import type { ScreenValue } from '../types/theme.types';
import type { MaybeArray } from '../types/util.types';
import { asArray } from './helpers';

export function getRuleSelectorGroup(rule: ParsedRule): SelectorGroup {
  if (rule.v.length == 0) return 'base';
  if (
    rule.v.includes('group') ||
    rule.v.includes('group-hover') ||
    rule.v.includes('group-active') ||
    rule.v.includes('group-focus')
  )
    return 'group';
  if (rule.v.includes('odd')) return 'odd';
  if (rule.v.includes('even')) return 'even';
  if (rule.v.includes('first')) return 'first';
  if (rule.v.includes('last')) return 'last';
  if (rule.v.includes('hover') || rule.v.includes('focus') || rule.v.includes('active'))
    return 'pointer';
  return 'base';
}

/**
 * @internal
 * @param screen
 * @param prefix
 * @returns
 */
export function mql(screen: MaybeArray<ScreenValue>, prefix = '@media '): string {
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
