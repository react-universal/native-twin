import {
  FlatList,
  FlatListProps,
  SectionList,
  SectionListProps,
  ViewStyle,
  VirtualizedList,
  VirtualizedListProps,
} from 'react-native';
import createStyledComponent, { invokeComponent } from '../../styled/StyledComponent';
import { Primitive, StyledProps, TemplateFunctions } from '../../types/styled.types';

export function styledFlatList<S>(
  chunks: TemplateStringsArray,
  ...functions: (Primitive | TemplateFunctions<S>)[]
) {
  return function <Type>(props: StyledProps & S & FlatListProps<Type>) {
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
  return function <Type>(props: StyledProps & S & SectionListProps<Type>) {
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
  return function <Type>(props: StyledProps & S & VirtualizedListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(
        chunks,
        ...functions,
      ),
      props,
    );
  };
}
