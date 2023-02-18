/* eslint-disable unused-imports/no-unused-vars */
import { ReactNode, useMemo } from 'react';
import { useClassNamesTransform, type IRegisterComponentArgs } from '@react-universal/core';
import { useGroupContext } from '../context/GroupContext';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useFinalStyles } from './useFinalStyles';

const useStyledComponent = (
  data: Omit<IRegisterComponentArgs, 'id'>,
  // originalChildren: ReactNode,
  componentProps: any,
  Component: any,
) => {
  const groupContext = useGroupContext();
  const { interactionStyles, normalStyles, parsed } = useClassNamesTransform(
    data.className ?? '',
  );
  const isGroupParent = useMemo(
    () => parsed.normalClassNames.some((item) => item === 'group'),
    [parsed.normalClassNames],
  );
  const { componentState, hasInteractions, panHandlers } = useComponentInteractions(
    { interactionStyles, isGroupParent, groupContext },
    componentProps,
  );
  const styles = useFinalStyles({
    componentState,
    interactionStyles,
    normalStyles,
    groupContext,
    isGroupParent,
  });
  // const children = useChildren(originalChildren, componentState);

  return {
    styles,
    panHandlers,
    isGroupParent,
    hasInteractions,
    componentState,
    groupContext,
    // children,
  };
};

export { useStyledComponent };