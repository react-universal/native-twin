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

export const styledFlatList =
  <S, TConfig>(config?: VariantsConfig<TConfig>) =>
  <Type,>(props: StyledProps<S & PropsWithVariants<TConfig> & FlatListProps<Type>>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList)(config),
      props,
    );

export const styledSectionList =
  <S, TConfig>(config?: VariantsConfig<TConfig>) =>
  <Type,>(props: S & PropsWithVariants<TConfig> & SectionListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList)(config),
      props,
    );

export const styledVirtualizedList =
  <S, TConfig>(config?: VariantsConfig<TConfig>) =>
  <Type,>(props: S & PropsWithVariants<TConfig> & VirtualizedListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(config),
      props,
    );
