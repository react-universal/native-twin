import { FlatList as NativeFlatList, FlatListProps } from 'react-native';
import { styled } from '@universal-labs/styled';

interface TFlatListProps<T extends unknown> extends FlatListProps<T> {}

const StyledFlatList = styled(NativeFlatList);

function FlatList<ItemsT>(
  props: TFlatListProps<ItemsT> & { className?: string; tw?: string },
) {
  return (
    // @ts-expect-error
    <StyledFlatList {...props} style={[]} />
  );
}

export { FlatList };
