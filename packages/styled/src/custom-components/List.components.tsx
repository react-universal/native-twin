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
import { PropsWithVariants, VariantsConfig } from '../styled/variants';
import { StyledProps } from '../types/styled.types';

export function styledFlatList<S, TConfig>(config?: VariantsConfig<TConfig>) {
  return function <Type>(
    props: StyledProps & PropsWithVariants<TConfig> & S & FlatListProps<Type>,
  ) {
    return invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList)(config),
      props,
    );
  };
}

export function styledSectionList<S, TConfig>(config?: VariantsConfig<TConfig>) {
  return function <Type>(props: S & PropsWithVariants<TConfig> & SectionListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList)(config),
      props,
    );
  };
}

export function styledVirtualizedList<S, TConfig>(config?: VariantsConfig<TConfig>) {
  return function <Type>(props: S & PropsWithVariants<TConfig> & VirtualizedListProps<Type>) {
    return invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(config),
      props,
    );
  };
}
