import { useMemo } from 'react';
import type { Touchable } from 'react-native';
import {
  useComponentStyleSheets,
  StyledProps,
  createComponentID,
} from '@universal-labs/stylesheets';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useRenderCounter } from './useRenderCounter';

function useBuildStyledComponent<T>({
  className,
  isFirstChild,
  isLastChild,
  nthChild,
  children,
  groupID,
  parentID,
  style,
  tw,
  ...restProps
}: StyledProps<T>) {
  useRenderCounter();
  console.time('useBuildStyledComponent');
  const componentID = useMemo(() => createComponentID() as string, []);
  const currentGroupID = useMemo(() => {
    return groupID ? groupID : parentID ?? 'non-group';
  }, [parentID, groupID]);
  const { composedStyles, stylesheet } = useComponentStyleSheets({
    groupID,
    className: className ?? tw,
    inlineStyles: style,
    isFirstChild,
    isLastChild,
    nthChild,
    parentID,
    currentGroupID,
    componentID,
  });

  const { componentInteractionHandlers, focusHandlers } = useComponentInteractions({
    props: restProps as Touchable,
    hasGroupInteractions: stylesheet.metadata.hasGroupEvents,
    hasPointerInteractions: stylesheet.metadata.hasPointerEvents,
    isGroupParent: stylesheet.metadata.isGroupParent,
    id: componentID,
  });

  const componentChilds = useChildren(
    children,
    componentID,
    [],
    () => [],
    currentGroupID === 'non-group' ? groupID ?? parentID ?? '' : currentGroupID,
  );

  const componentStyles = useMemo(() => {
    const styles = stylesheet.create();
    return styles;
  }, [stylesheet]);
  console.timeEnd('useBuildStyledComponent');
  return {
    componentChilds,
    componentInteractionHandlers,
    focusHandlers,
    composedStyles,
    componentStyles,
  };
}

export { useBuildStyledComponent };
