import {
  FlatList,
  type FlatListProps,
  SectionList,
  type SectionListProps,
  type ViewStyle,
  VirtualizedList,
  type VirtualizedListProps,
} from 'react-native';
import createStyledComponent, { invokeComponent } from '../../styled/StyledComponent';
import type {
  Primitive,
  StyledComponentProps,
  TemplateFunctions,
} from '../../types/styled.types';

export function styledFlatList<S>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S>)[]
) {
  return function <Type>(props: StyledComponentProps & S & FlatListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList)(chunks, ...functions),
      props,
    );
  };
}

export function styledSectionList<S>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S>)[]
) {
  return function <Type>(props: StyledComponentProps & S & SectionListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList)(
        chunks,
        ...functions,
      ),
      props,
    );
  };
}

export function styledVirtualizedList<S>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S>)[]
) {
  return function <Type>(props: StyledComponentProps & S & VirtualizedListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(
        chunks,
        ...functions,
      ),
      props,
    );
  };
}
