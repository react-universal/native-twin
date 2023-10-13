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
import type { StyledComponentProps } from '../../types/styled.types';

export function styledFlatList<Type>(props: StyledComponentProps & FlatListProps<Type>) {
  return invokeComponent(
    createStyledComponent<ViewStyle, FlatListProps<Type>>(FlatList),
    props,
  );
}
export function styledSectionList<Type>(props: StyledComponentProps & SectionListProps<Type>) {
  return invokeComponent(
    createStyledComponent<ViewStyle, SectionListProps<Type>>(SectionList),
    props,
  );
}

export function styledVirtualizedList<Type>(
  props: StyledComponentProps & VirtualizedListProps<Type>,
) {
  return invokeComponent(
    createStyledComponent<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList),
    props,
  );
}
