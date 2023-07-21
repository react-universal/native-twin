import {
  FlatList,
  FlatListProps,
  SectionList,
  SectionListProps,
  ViewStyle,
  VirtualizedList,
  VirtualizedListProps,
} from 'react-native';
import createStyledComponent, { invokeComponent } from '../native/StyledComponent';
import { Primitive, StyledProps, TemplateFunctions } from '../types/styled.types';

export const styledFlatList =
  <S,>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & FlatListProps<any>>)[]
  ) =>
  <Type,>(props: StyledProps<S & FlatListProps<Type>>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList)(chunks, ...functions),
      props,
    );

styledFlatList.attrs =
  <S, Result extends Partial<S & FlatListProps<any>> = {}>(
    opts: Result | ((props: S & FlatListProps<any>) => Result),
  ) =>
  (chunks: TemplateStringsArray, ...functions: (Primitive | TemplateFunctions<S>)[]) =>
  <Props,>(componentProps: Omit<FlatListProps<Props>, keyof Result> & S & Partial<Result>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, FlatListProps<Props>>(FlatList).attrs<S>(opts)(
        chunks,
        ...functions,
      ),
      componentProps as any,
    );

export const styledSectionList =
  <S,>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & SectionListProps<any>>)[]
  ) =>
  <Type,>(props: S & SectionListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList)(
        chunks,
        ...functions,
      ),
      props,
    );
styledSectionList.attrs =
  <S, Result extends Partial<S & SectionListProps<any>> = {}>(
    opts: Result | ((props: S & SectionListProps<any>) => Result),
  ) =>
  (chunks: TemplateStringsArray, ...functions: (Primitive | TemplateFunctions<S>)[]) =>
  <Props,>(
    componentProps: Omit<SectionListProps<Props>, keyof Result> & S & Partial<Result>,
  ) =>
    invokeComponent(
      createStyledComponent<ViewStyle, SectionListProps<Props>>(SectionList).attrs<S>(opts)(
        chunks,
        ...functions,
      ),
      componentProps as any,
    );
export const styledVirtualizedList =
  <S,>(
    chunks: TemplateStringsArray,
    ...functions: (Primitive | TemplateFunctions<S & VirtualizedListProps<any>>)[]
  ) =>
  <Type,>(props: S & VirtualizedListProps<Type>) =>
    invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(
        chunks,
        ...functions,
      ),
      props,
    );
styledVirtualizedList.attrs =
  <S, Result extends Partial<S & VirtualizedListProps<any>> = {}>(
    opts: Result | ((props: S & VirtualizedListProps<any>) => Result),
  ) =>
  (chunks: TemplateStringsArray, ...functions: (Primitive | TemplateFunctions<S>)[]) =>
  <Props,>(
    componentProps: Omit<VirtualizedListProps<Props>, keyof Result> & S & Partial<Result>,
  ) =>
    invokeComponent(
      createStyledComponent<ViewStyle, VirtualizedListProps<Props>>(VirtualizedList).attrs<S>(
        opts,
      )(chunks, ...functions),
      componentProps as any,
    );
