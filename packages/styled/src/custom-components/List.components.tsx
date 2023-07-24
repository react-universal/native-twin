import {
  FlatList,
  FlatListProps,
  SectionList,
  SectionListProps,
  ViewStyle,
  VirtualizedList,
  VirtualizedListProps,
} from 'react-native';
import createStyledComponent, { invokeComponent } from '../styled/StyledComponent';
import { PropsWithVariants } from '../styled/variants';
import { Primitive, StyledProps, TemplateFunctions } from '../types/styled.types';

export function styledFlatList<S>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S & FlatListProps<any>>)[]
) {
  return function <Type>(props: StyledProps & S & FlatListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList)(chunks, ...functions),
      props,
    );
  };
}

export function styledSectionList<S, TConfig>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S & SectionListProps<any>>)[]
) {
  return function <Type>(props: S & PropsWithVariants<TConfig> & SectionListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList)(
        chunks,
        ...functions,
      ),
      props,
    );
  };
}

export function styledVirtualizedList<S, TConfig>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S & VirtualizedListProps<any>>)[]
) {
  return function <Type>(props: S & PropsWithVariants<TConfig> & VirtualizedListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(
        chunks,
        ...functions,
      ),
      props,
    );
  };
}
