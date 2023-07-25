import {
  forwardRef,
  type ComponentType,
  Ref,
  ForwardRefExoticComponent,
  createElement,
} from 'react';
import { StyleProp } from 'react-native';
import { useBuildStyledComponent } from '../hooks/useStyledComponent';
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
        // const start = performance.now();
        const classNames = classNamesGenerator(props);
        const {
          componentChilds,
          componentInteractionHandlers,
          componentStyles,
          currentGroupID,
          focusHandlers,
        } = useBuildStyledComponent({ ...props, className: classNames });
        const newProps = {
          ...props,
        };
        Reflect.deleteProperty(newProps, 'className');
        Reflect.deleteProperty(newProps, 'tw');
        // console.log('TOOK: ', performance.now() - start);
        return createElement(Component, {
          ...newProps,
          style: componentStyles,
          ref,
          children: componentChilds,
          groupID: currentGroupID,
          ...focusHandlers,
          ...componentInteractionHandlers,
        });
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
