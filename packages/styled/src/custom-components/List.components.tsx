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

export const styledFlatList =
  <S,>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & FlatListProps<any>>)[]
  ) =>
  <Type,>(props: StyledProps & S & FlatListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList)(chunks, ...functions),
      props,
    );

export const styledSectionList =
  <S, TConfig>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & SectionListProps<any>>)[]
  ) =>
  <Type,>(props: S & PropsWithVariants<TConfig> & SectionListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList)(
        chunks,
        ...functions,
      ),
      props,
    );

export const styledVirtualizedList =
  <S, TConfig>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & VirtualizedListProps<any>>)[]
  ) =>
  <Type,>(props: S & PropsWithVariants<TConfig> & VirtualizedListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(
        chunks,
        ...functions,
      ),
      props,
    );
