import { FlatList as NativeFlatList } from 'react-native';
import { styled } from '@universal-labs/styled';

const FlatList = styled(NativeFlatList, {
  props: { contentContainerStyle: true },
});

export { FlatList };
