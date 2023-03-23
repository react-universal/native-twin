import type { Touchable } from 'react-native';
import {
  IExtraProperties,
  TInternalStyledComponentProps,
  useComponentStyleSheets,
} from '@universal-labs/stylesheets';
import type { StyledOptions, StyledProps } from '../types/styled.types';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useComponentInteractions } from './useComponentInteractions';

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  Component: any,
  ref: any,
  styledOptions?: StyledOptions<T, P>,
) {
  const classProps = useBuildStyleProps(props, styledOptions);
  const { styleProps, getInteractionStyles, componentID, interactionsMeta } =
    useComponentStyleSheets({
      classProps,
      inlineStyles: props.style,
      isFirstChild: props.isFirstChild,
      isLastChild: props.isLastChild,
      nthChild: props.nthChild,
      parentID: props.parentID,
    });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: props as Touchable,
    component: {
      hasGroupInteractions: interactionsMeta.hasGroupInteractions,
      hasPointerInteractions: interactionsMeta.hasPointerInteractions,
      isGroupParent: interactionsMeta.isGroupParent,
      id: componentID,
    },
  });
  console.log('STYLE_ ', componentInteractionHandlers);
  const element = (
    <Component
      {...props}
      {...styleProps}
      {...componentInteractionHandlers}
      // style={[component.styles, style]}
      // key={component.id}
      // forwardedRef={ref}
      ref={ref}
    >
      {props.children}
    </Component>
  );

  return element;
}

export { useBuildStyledComponent };
