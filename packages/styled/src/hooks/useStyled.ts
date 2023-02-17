import { useClassNamesTransform, type IRegisterComponentArgs } from '@react-universal/core';
import { useComponentInteractions } from './useComponentInteractions';
import { useFinalStyles } from './useFinalStyles';

const useStyledComponent = (data: Omit<IRegisterComponentArgs, 'id'>, componentProps: any) => {
  const { interactionStyles, normalStyles } = useClassNamesTransform(data.className ?? '');
  const { componentState, hasInteractions, panHandlers } = useComponentInteractions(
    { interactionStyles },
    componentProps,
  );
  const styles = useFinalStyles({
    componentState,
    interactionStyles,
    normalStyles,
  });

  console.group('COMPONENT_RENDER');
  console.log('HAS_INTERACTIONS: ', hasInteractions);
  console.log('CLASSNAMES: ', data.className);
  console.groupEnd();

  return {
    styles,
    panHandlers,
    hasInteractions,
    componentState,
  };
};

export { useStyledComponent };
