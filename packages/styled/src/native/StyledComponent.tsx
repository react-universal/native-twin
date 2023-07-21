/* eslint-disable react/display-name */
import { forwardRef, type ComponentType, Ref, ForwardRefExoticComponent } from 'react';
import { StyleProp } from 'react-native';
import { StyledProps } from '../types/styled.types';
import { useBuildStyledComponent } from './hooks/useStyledComponent';

function createStyledComponent<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps & StyledProps<{}> = InitialProps & StyledProps<{}>,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S>() {
    const ForwardRefComponent = forwardRef<any, S & Props>((props: S & Props, ref) => {
      const {
        componentChilds,
        componentInteractionHandlers,
        componentStyles,
        currentGroupID,
        focusHandlers,
      } = useBuildStyledComponent(props);

      const newProps = {
        ...props,
        style: componentStyles,
        children: componentChilds,
        groupID: currentGroupID,
        ...focusHandlers,
        ...componentInteractionHandlers,
      };
      return <Component ref={ref} {...newProps} />;
    });
    return ForwardRefComponent as ForwardRefExoticComponent<Props & S & { ref?: Ref<any> }>;
  }

  styledComponent.attrs =
    <Part, Result extends Partial<Props & Part> = Partial<Props & Part>>(
      opts: Result | ((props: Props & Part) => Result),
    ) =>
    () => {
      const ComponentWithAttrs = styledComponent();
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
