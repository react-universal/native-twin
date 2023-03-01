import { useMemo } from 'react';
import type { Touchable } from 'react-native';
import { useTailwindContext } from '../context/TailwindContext';
import type { IExtraProperties } from '../types/styles.types';
import { parseClassNames } from '../utils/components.utils';
import { useComponentInteractions, useComponentState } from './styled';
import { useChildren } from './useChildren';
import { useFinalStyles } from './useFinalStyles';
import { useStore } from './useStore';

const useStyledComponent = <Props extends Object>({
  className,
  children,
  tw,
  ...componentProps
}: Props & IExtraProperties<Props>) => {
  const tailwindContext = useTailwindContext();
  const component = useStore(className ?? tw ?? '');
  const parsedClassNames = useMemo(() => parseClassNames(className), [className]);
  const isGroupParent = useMemo(
    () => parsedClassNames.normalClassNames.some((item) => item === 'group'),
    [parsedClassNames.normalClassNames],
  );

  const componentState = useComponentState({
    component,
    componentProps,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: { ...componentProps, children } as Touchable,
    componentState,
    isGroupParent,
  });
  const { styles, hasInteractions, hasGroupInteractions } = useFinalStyles({
    styleSheet: component.styleSheet,
    isGroupParent,
    componentProps,
    componentState,
  });
  const componentChilds = useChildren(children);

  return {
    styles,
    isGroupParent,
    componentChilds,
    hasInteractions,
    componentState,
    tailwindContext,
    component,
    hasGroupInteractions,
    componentInteractionHandlers,
  };
};

export { useStyledComponent };
