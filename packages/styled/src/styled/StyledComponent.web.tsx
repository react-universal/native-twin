import {
  forwardRef,
  type ComponentType,
  type Ref,
  type ForwardRefExoticComponent,
} from 'react';
import type { StyleProp } from 'react-native';
import { cx } from '@universal-labs/native-tailwind';
import type {
  Primitive,
  StyledComponentProps,
  TemplateFunctions,
} from '../types/styled.types';
import { buildCSSString } from '../utils/buildCssString';
import { getComponentDisplayName } from '../utils/getComponentDisplayName';
import { type VariantProps, type VariantsConfig, createVariants } from './variants';

function styledComponentsFactory<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps = InitialProps,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & Props & StyledComponentProps>)[]
  ): ForwardRefExoticComponent<Props & S & StyledComponentProps & { ref?: Ref<any> }> {
    const ForwardRefComponent = forwardRef<any, S & Props>(
      (props: S & Props & StyledComponentProps, ref) => {
        const classNames = cx`${buildCSSString(chunks, functions, props)}`;
        return (
          <Component
            {...props}
            style={[
              {
                $$css: true,
                [classNames]: classNames,
              },
              props.style,
            ]}
            ref={ref}
          />
        );
      },
    );
    if (__DEV__) {
      ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    }
    return ForwardRefComponent as any;
  }

  styledComponent.variants = <TConfig,>(config?: VariantsConfig<TConfig>) => {
    const classNamesGenerator = createVariants(config!);
    // @ts-expect-error
    const ComponentWithVariants = styledComponent`${(props) => classNamesGenerator(props)}`;

    // We need to limit the props control to only Result https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABBATgUwIZTQUQB7ZgAmaRAwnALYAOAPAAopzUDOAfABQU0BciH1Jqz6NmLAJSIAvG0QYwAT0kBvAFCJkCFlET5CJYt2rT+gsSKETpstRo3ooIFEiMDL49YgC+nvWmL+5FTUAHRYUCgsJrQASmgsIAA2OmgEgVH0GCiwGIkMlmyc4ZF8cQnJkjKItnYQWjqMaHVgwDAA5k5YpEYmbua6eBCJICT5YgA0iGVJUGyVNp52iA5OLsEcyiFbZqyTW2FQESxeHks+SyvOiI3NrR0oXUE0nufLaI5XfgGGwao+qqBILAEIgen1hNVENhtHxtCgYGA2pNtApEmhYREEW1vCpPJckDsWH9VM1tNd0Ld2j0pMh0F0viQntQuMFxAcjhsofEoHwAORwADWvJxqhuCDurmUiBRaL50KgwpOQA
    const ForwardRefComponent = forwardRef<
      any,
      VariantProps<typeof classNamesGenerator> & StyledComponentProps & Props
    >((props, ref) => {
      return <ComponentWithVariants ref={ref} {...(props as Props)} />;
    });
    if (__DEV__) {
      ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    }
    // TODO : Find a way to remove from the Props the properties affected by opts
    return ForwardRefComponent;
  };

  return styledComponent;
}

export default styledComponentsFactory;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
