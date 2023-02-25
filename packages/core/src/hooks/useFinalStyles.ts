import { useMemo } from 'react';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import type { IUseComponentState } from './styled/useComponentState';

interface IFinalStylesArgs {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  isGroupParent: boolean;
  componentProps: any;
  componentState: IUseComponentState;
}
const useFinalStyles = ({
  normalStyles,
  interactionStyles,
  isGroupParent,
  componentState,
}: IFinalStylesArgs) => {
  // DETERMINE IF THE COMPONENT HAS INTERACTIONS AND LEVEL OF INTERACTIONS
  const hasInteractions = useMemo(() => interactionStyles.length > 0, [interactionStyles]);
  const hasGroupInteractions = useMemo(
    () => interactionStyles.some((item) => item[0] === 'group-hover'),
    [interactionStyles],
  );
  // useComponentInteraction -> create interaction handler using reanimated

  const styles = useMemo(() => {
    if (
      !isGroupParent &&
      hasGroupInteractions &&
      componentState.parentGroupHoverInteraction.state
    ) {
      return {
        ...normalStyles,
        ...componentState.groupHoverInteraction.interactionStyle,
      };
    }
    if (componentState.hoverInteraction.state) {
      return {
        ...normalStyles,
        ...componentState.hoverInteraction.interactionStyle,
      };
    }
    return normalStyles;
  }, [hasGroupInteractions, isGroupParent, normalStyles, componentState]);
  return {
    styles,
    hasInteractions,
    hasGroupInteractions,
  };
};

export { useFinalStyles };
