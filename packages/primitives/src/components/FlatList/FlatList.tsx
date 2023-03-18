import type { ComponentProps } from 'react';
import { FlatList as NativeFlatList, FlatListProps } from 'react-native';
import { styled } from '@universal-labs/styled';

type MergeProps<P1, P2> = Omit<P1, keyof P2> & P2;

const StyledFlatList = styled(NativeFlatList, {
  classProps: ['contentContainerStyle'],
});

function FlatList<T>(
  props: MergeProps<ComponentProps<typeof StyledFlatList>, FlatListProps<T>>,
) {
  // @ts-expect-error
  return <StyledFlatList {...props} />;
}

export { FlatList };
