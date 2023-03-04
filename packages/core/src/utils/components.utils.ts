import type {
  TInteractionPseudoSelectors,
  TAppearancePseudoSelectors,
} from '../types/store.types';

export function selectorIsInteraction(
  selector: string,
): selector is TInteractionPseudoSelectors {
  return (
    selector === 'hover' ||
    selector === 'active' ||
    selector === 'focus' ||
    selector.startsWith('group-')
  );
}

export function selectorIsAppearance(
  selector: string,
): selector is TAppearancePseudoSelectors {
  return selector === 'dark' || selector === 'last' || selector === 'first';
}
