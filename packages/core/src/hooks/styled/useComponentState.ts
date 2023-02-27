import type { IComponentInteractions } from '../../types/store.types';
import { useComponentInteractionState, useContextComponentInteractionState } from '../events';

interface UseComponentStateArgs {
  interactionStyles: IComponentInteractions[];
  componentProps: any;
  normalClassNames: string[];
}

const useComponentState = ({ interactionStyles }: UseComponentStateArgs) => {
  const hoverInteraction = useComponentInteractionState(interactionStyles, 'hover');
  const activeInteraction = useComponentInteractionState(interactionStyles, 'active');
  const focusInteraction = useComponentInteractionState(interactionStyles, 'focus');
  const groupHoverInteraction = useComponentInteractionState(interactionStyles, 'group-hover');
  const colorScheme = useComponentInteractionState(interactionStyles, 'dark');
  const parentGroupHoverInteraction = useContextComponentInteractionState(
    interactionStyles,
    'group-hover',
  );
  return {
    hoverInteraction,
    activeInteraction,
    focusInteraction,
    groupHoverInteraction,
    parentGroupHoverInteraction,
    colorScheme,
  };
};

export type IUseComponentState = ReturnType<typeof useComponentState>;

export { useComponentState };
