import {
  forwardRef,
  type ComponentType,
  Ref,
  ForwardRefExoticComponent,
  createElement,
} from 'react';
import { StyleProp } from 'react-native';
import { useBuildStyledComponent } from '../hooks/useStyledComponent';
import { Primitive, StyledProps, TemplateFunctions } from '../types/styled.types';
import { buildCSSString } from '../utils/buildCssString';
import { getComponentDisplayName } from '../utils/getComponentDisplayName';
import { PropsWithVariants, VariantsConfig, createVariants } from './variants';

function styledComponentsFactory<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps = InitialProps,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S, TConfig>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & Props>)[]
  ): ForwardRefExoticComponent<
    Props & S & StyledProps & PropsWithVariants<TConfig> & { ref?: Ref<any> }
  > {
    const ForwardRefComponent = forwardRef<any, S & Props & PropsWithVariants<TConfig>>(
      (props: S & Props & StyledProps & PropsWithVariants<TConfig>, ref) => {
        const classNames = buildCSSString(chunks, functions, props);
        // const start = performance.now();
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
    if (__DEV__) {
      ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    }
    return ForwardRefComponent as any;
  }

  styledComponent.variants = <TConfig,>(config?: VariantsConfig<TConfig>) => {
    const classNamesGenerator = createVariants(config!);
    const ComponentWithVariants = styledComponent`${(props) => classNamesGenerator(props)}`;

    // We need to limit the props control to only Result https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABBATgUwIZTQUQB7ZgAmaRAwnALYAOAPAAopzUDOAfABQU0BciH1Jqz6NmLAJSIAvG0QYwAT0kBvAFCJkCFlET5CJYt2rT+gsSKETpstRo3ooIFEiMDL49YgC+nvWmL+5FTUAHRYUCgsJrQASmgsIAA2OmgEgVH0GCiwGIkMlmyc4ZF8cQnJkjKItnYQWjqMaHVgwDAA5k5YpEYmbua6eBCJICT5YgA0iGVJUGyVNp52iA5OLsEcyiFbZqyTW2FQESxeHks+SyvOiI3NrR0oXUE0nufLaI5XfgGGwao+qqBILAEIgen1hNVENhtHxtCgYGA2pNtApEmhYREEW1vCpPJckDsWH9VM1tNd0Ld2j0pMh0F0viQntQuMFxAcjhsofEoHwAORwADWvJxqhuCDurmUiBRaL50KgwpOQA
    const ForwardRefComponent = forwardRef<any, PropsWithVariants<TConfig> & StyledProps>(
      (props, ref) => {
        return (
          <ComponentWithVariants
            ref={ref}
            {...(props as Props & PropsWithVariants<TConfig>)}
          />
        );
      },
    );
    if (__DEV__) {
      ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
    }
    // TODO : Find a way to remove from the Props the properties affected by opts
    return ForwardRefComponent;
  };

  // provide styled(Comp).attrs({} | () => {}) feature
  // styledComponent.attrs =
  //   <Part, Result extends Partial<Props & Part> = Partial<Props & StyledProps & Part>>(
  //     opts: Result | ((props: Props & Part) => Result),
  //   ) =>
  //   (
  //     chunks: TemplateStringsArray,
  //     ...functions: (Primitive | TemplateFunctions<Props & Part>)[]
  //   ) => {
  //     const ComponentWithAttrs = styledComponent(chunks, ...functions);
  //     // We need to limit the props control to only Result https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABBATgUwIZTQUQB7ZgAmaRAwnALYAOAPAAopzUDOAfABQU0BciH1Jqz6NmLAJSIAvG0QYwAT0kBvAFCJkCFlET5CJYt2rT+gsSKETpstRo3ooIFEiMDL49YgC+nvWmL+5FTUAHRYUCgsJrQASmgsIAA2OmgEgVH0GCiwGIkMlmyc4ZF8cQnJkjKItnYQWjqMaHVgwDAA5k5YpEYmbua6eBCJICT5YgA0iGVJUGyVNp52iA5OLsEcyiFbZqyTW2FQESxeHks+SyvOiI3NrR0oXUE0nufLaI5XfgGGwao+qqBILAEIgen1hNVENhtHxtCgYGA2pNtApEmhYREEW1vCpPJckDsWH9VM1tNd0Ld2j0pMh0F0viQntQuMFxAcjhsofEoHwAORwADWvJxqhuCDurmUiBRaL50KgwpOQA
  //     const ForwardRefComponent = forwardRef<
  //       any,
  //       Omit<Props, keyof Result> &
  //         StyledProps &
  //         Part &
  //         Partial<Pick<Props, Extract<keyof Props, keyof Result>>>
  //     >((props, ref) => {
  //       const attrs = opts instanceof Function ? opts(props as Props & Part) : opts;
  //       return <ComponentWithAttrs ref={ref} {...(props as Props & Part)} {...attrs} />;
  //     });
  //     if (__DEV__) {
  //       ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
  //     }
  //     // TODO : Find a way to remove from the Props the properties affected by opts
  //     return ForwardRefComponent;
  //   };

  return styledComponent;
}

export default styledComponentsFactory;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
