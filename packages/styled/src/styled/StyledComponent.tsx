/* eslint-disable react/display-name */
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
import { buildClassNames } from '../utils/buildClassNames';
import { PropsWithVariants, VariantsConfig, createVariants } from './variants';

function createStyledComponent<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps = InitialProps,
>(Component: ComponentType<InitialProps>) {
  function styledComponent<S>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & StyledProps & Props>)[]
  ): ForwardRefExoticComponent<Props & S & StyledProps & { ref?: Ref<any> }> {
    const ForwardRefComponent = forwardRef<any, S & Props>(
      (props: S & Props & StyledProps, ref) => {
        const classNames = buildClassNames(chunks, functions, props);
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
    return ForwardRefComponent as any;
  }

  // provide styled(Comp).attrs({} | () => {}) feature
  styledComponent.withVariants = function <
    Part,
    TConfig,
    Result extends Partial<Props & Part> = Partial<Props & Part>,
  >(config: VariantsConfig<TConfig>) {
    const classNamesGenerator = createVariants(config);
    // We need to limit the props control to only Result https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABBATgUwIZTQUQB7ZgAmaRAwnALYAOAPAAopzUDOAfABQU0BciH1Jqz6NmLAJSIAvG0QYwAT0kBvAFCJkCFlET5CJYt2rT+gsSKETpstRo3ooIFEiMDL49YgC+nvWmL+5FTUAHRYUCgsJrQASmgsIAA2OmgEgVH0GCiwGIkMlmyc4ZF8cQnJkjKItnYQWjqMaHVgwDAA5k5YpEYmbua6eBCJICT5YgA0iGVJUGyVNp52iA5OLsEcyiFbZqyTW2FQESxeHks+SyvOiI3NrR0oXUE0nufLaI5XfgGGwao+qqBILAEIgen1hNVENhtHxtCgYGA2pNtApEmhYREEW1vCpPJckDsWH9VM1tNd0Ld2j0pMh0F0viQntQuMFxAcjhsofEoHwAORwADWvJxqhuCDurmUiBRaL50KgwpOQA
    const ForwardRefComponent = forwardRef<
      any,
      Omit<Props, keyof Result> &
        Part &
        Pick<Props, Extract<keyof Props, keyof Result>> &
        PropsWithVariants<TConfig> &
        StyledProps
    >((props, ref) => {
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
      } as Props & Part;
      Reflect.deleteProperty(newProps, 'className');
      Reflect.deleteProperty(newProps, 'tw');
      return createElement(Component, {
        ...newProps,
        style: componentStyles,
        ref,
        children: componentChilds,
        groupID: currentGroupID,
        ...focusHandlers,
        ...componentInteractionHandlers,
      });
    });
    // TODO : Find a way to remove from the Props the properties affected by opts
    return ForwardRefComponent;
  };

  return styledComponent;
}

export default createStyledComponent;

export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
  // @ts-expect-error
  return <Component {...props} />;
}
