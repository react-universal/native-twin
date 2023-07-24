/* eslint-disable react/display-name */
import {
  forwardRef,
  type ComponentType,
  Ref,
  ForwardRefExoticComponent,
  createElement,
} from 'react';
import { StyleProp } from 'react-native';
import { StyledProps } from '../types/styled.types';
import { useBuildStyledComponent } from './hooks/useStyledComponent';
import { PropsWithVariants, VariantsConfig, createVariants } from './variants';

function createStyledComponent<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends StyledProps & InitialProps = StyledProps & InitialProps,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S, TConfig>(
    config?: VariantsConfig<TConfig>,
  ): ForwardRefExoticComponent<Props & S & PropsWithVariants<TConfig> & { ref?: Ref<any> }> {
    const generator = createVariants(config!);
    const ForwardRefComponent = forwardRef<any, S & Props & PropsWithVariants<TConfig>>(
      (props: S & Props, ref) => {
        // @ts-expect-error
        const classNames = generator(props);
        const {
          componentChilds,
          componentInteractionHandlers,
          componentStyles,
          currentGroupID,
          focusHandlers,
        } = useBuildStyledComponent({ ...props, className: classNames });

        return createElement(Component, {
          ...props,
          style: componentStyles,
          ref,
          children: componentChilds,
          groupID: currentGroupID,
          ...focusHandlers,
          ...componentInteractionHandlers,
        });
      },
    );
    return ForwardRefComponent as any;
  }

  return styledComponent;
}

export default createStyledComponent;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
