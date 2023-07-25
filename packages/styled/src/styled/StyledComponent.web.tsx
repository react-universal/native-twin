import {
  forwardRef,
  type ComponentType,
  Ref,
  ForwardRefExoticComponent,
  createElement,
  useMemo,
  ReactNode,
} from 'react';
import { StyleProp } from 'react-native';
import { cx } from '@twind/core';
import { CompleteStyle } from '@universal-labs/css';
import { StyledProps } from '../types/styled.types';
import { getComponentDisplayName } from '../utils/getComponentDisplayName';
import { PropsWithVariants, VariantsConfig, createVariants } from './variants';

function createStyledComponent<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps = InitialProps,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S, TConfig>(
    config?: VariantsConfig<TConfig>,
  ): ForwardRefExoticComponent<
    Props & S & StyledProps & PropsWithVariants<TConfig> & { ref?: Ref<any> }
  > {
    const classNamesGenerator = createVariants(config!);
    const ForwardRefComponent = forwardRef<any, S & Props & PropsWithVariants<TConfig>>(
      (props: S & Props & StyledProps & PropsWithVariants<TConfig>, ref) => {
        const styles = useMemo(() => {
          const classNames = classNamesGenerator(props);
          const mergedClassName = cx(props.className ?? '') ? cx(...[classNames]) : '';
          if (mergedClassName && props.style) {
            return [
              { $$css: true, [mergedClassName]: mergedClassName } as CompleteStyle,
              props.style,
            ];
          } else if (mergedClassName) {
            return { $$css: true, [mergedClassName]: mergedClassName } as CompleteStyle;
          } else if (props.style) {
            return props.style;
          }
          return {};
        }, [props]);

        const transformedComponent = createElement(Component, {
          ...props,
          style: [styles],
          ref,
        } as unknown as any);
        let returnValue: ReactNode = transformedComponent;

        return returnValue;
      },
    );
    ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    return ForwardRefComponent as any;
  }

  return styledComponent;
}

export default createStyledComponent;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
