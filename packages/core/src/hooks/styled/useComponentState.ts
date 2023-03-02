import type ComponentNode from '../../store/ComponentNode';
import { useComponentInteractionState, useContextComponentInteractionState } from '../events';

interface UseComponentStateArgs {
  componentProps: any;
  component: ComponentNode;
}

const useComponentState = ({ component }: UseComponentStateArgs) => {
  const hoverInteraction = useComponentInteractionState(component, 'hover');
  const activeInteraction = useComponentInteractionState(component, 'active');
  const focusInteraction = useComponentInteractionState(component, 'focus');
  const lastChildInteraction = useComponentInteractionState(component, 'last');
  const groupHoverInteraction = useComponentInteractionState(component, 'group-hover');
  const colorScheme = useComponentInteractionState(component, 'dark');
  const parentGroupHoverInteraction = useContextComponentInteractionState(
    component.styleSheet.interactionStyles,
    'group-hover',
  );
  return {
    hoverInteraction,
    activeInteraction,
    focusInteraction,
    groupHoverInteraction,
    parentGroupHoverInteraction,
    colorScheme,
    lastChildInteraction,
  };
};

export type IUseComponentState = ReturnType<typeof useComponentState>;

export { useComponentState };
