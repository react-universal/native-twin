/* eslint-disable react/display-name */
import {
  forwardRef,
  type ComponentType,
  useMemo,
  Ref,
  ForwardRefExoticComponent,
} from 'react';
import { StyleProp, StyleSheet, Touchable } from 'react-native';
import type { AnyStyle } from '@universal-labs/css';
import { Primitive, StyledProps, TemplateFunctions } from '../types/styled.types';
import { useChildren } from './hooks/useChildren';
import { useComponentInteractions } from './hooks/useComponentInteractions';
import { useComponentRegistry } from './hooks/useComponentRegistry';
import { useCssToRN } from './hooks/useCssToRN';

function createStyledComponent<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps & StyledProps<{}> = InitialProps & StyledProps<{}>,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S>(
    _chunks: TemplateStringsArray,
    ..._functions: (Primitive | TemplateFunctions<S & Props>)[]
  ) {
    const ForwardRefComponent = forwardRef<any, S & Props>((props: S & Props, ref) => {
      const { componentID, stylesheet } = useCssToRN(props.className ?? props.tw ?? '');
      const { component, parentComponent, currentGroupID } = useComponentRegistry({
        componentID,
        groupID: props.groupID,
        isGroupParent: stylesheet.metadata.isGroupParent,
        parentID: props.parentID,
      });

      const { focusHandlers, componentInteractionHandlers } = useComponentInteractions({
        hasGroupInteractions: stylesheet.metadata.hasGroupEvents,
        hasPointerInteractions: stylesheet.metadata.hasPointerEvents,
        isGroupParent: stylesheet.metadata.isGroupParent,
        id: componentID,
        props: props as Touchable,
      });

      const componentChilds = useChildren(
        props.children,
        componentID,
        stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
        stylesheet.getChildStyles,
      );

      const componentStyles = useMemo(() => {
        const styles: AnyStyle = stylesheet.getStyles({
          isParentActive:
            parentComponent.active || parentComponent.focus || parentComponent.hover,
          isPointerActive:
            component.interactionState.active ||
            component.interactionState.focus ||
            component.interactionState.hover,
        });
        return StyleSheet.create({
          generated: {
            ...styles,
            // @ts-expect-error
            ...props.style,
          },
        }).generated;
      }, [component.interactionState, stylesheet, parentComponent, props.style]);

      const newProps = {
        ...props,
        style: componentStyles,
        children: componentChilds,
        groupID: currentGroupID,
        ...focusHandlers,
        ...componentInteractionHandlers,
      };
      return <Component ref={ref} {...props} {...newProps} />;
    });
    return ForwardRefComponent as ForwardRefExoticComponent<Props & S & { ref?: Ref<any> }>;
  }

  styledComponent.attrs =
    <Part, Result extends Partial<Props & Part> = Partial<Props & Part>>(
      opts: Result | ((props: Props & Part) => Result),
    ) =>
    (
      chunks: TemplateStringsArray,
      ...functions: (Primitive | TemplateFunctions<Props & Part>)[]
    ) => {
      const ComponentWithAttrs = styledComponent(chunks, ...functions);
      const ForwardRefComponent = forwardRef<
        any,
        Omit<Props, keyof Result> &
          Part &
          Partial<Pick<Props, Extract<keyof Props, keyof Result>>>
      >((props, ref) => {
        const attrs = opts instanceof Function ? opts(props as Props & Part) : opts;
        return <ComponentWithAttrs ref={ref} {...(props as Props & Part)} {...attrs} />;
      });
      return ForwardRefComponent;
    };

  return styledComponent;
}

export default createStyledComponent;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
