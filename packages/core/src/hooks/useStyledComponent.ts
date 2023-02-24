import { useMemo } from 'react';
import { useTailwindContext } from '../context/TailwindContext';
import type { IExtraProperties } from '../types/styles.types';
import { parseClassNames } from '../utils/components.utils';
import { useChildren } from './useChildren';
import { useFinalStyles } from './useFinalStyles';
import { useStore } from './useStore';

const useStyledComponent = <Props extends Object>({
  className,
  children,
  tw,
  ...restProps
}: Props & IExtraProperties) => {
  const tailwindContext = useTailwindContext();
  const { interactionStyles, normalStyles } = useStore(className ?? tw ?? '');
  const parsedClassNames = useMemo(() => parseClassNames(className), [className]);
  const isGroupParent = useMemo(
    () => parsedClassNames.normalClassNames.some((item) => item === 'group'),
    [parsedClassNames.normalClassNames],
  );
  const { styles, hasInteractions, componentState, hasGroupInteractions, gesture } =
    useFinalStyles({
      interactionStyles,
      normalStyles,
      isGroupParent,
      componentProps: restProps,
    });
  const componentChilds = useChildren(children);

  return {
    styles,
    isGroupParent,
    componentChilds,
    hasInteractions,
    componentState,
    tailwindContext,
    normalStyles,
    hasGroupInteractions,
    gesture,
  };
};

export { useStyledComponent };
