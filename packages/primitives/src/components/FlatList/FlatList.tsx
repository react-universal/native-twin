import { FlatList as NativeFlatList, FlatListProps, StyleProp, ViewStyle } from 'react-native';
import { styled } from '@universal-labs/styled';

const StyledFlatList = styled(NativeFlatList);

function FlatList<TItems>({
  className,
  tw,
  ...props
}: Omit<FlatListProps<TItems>, 'contentContainerStyle'> & {
  className?: string;
  tw?: string;
  contentContainerStyle?: string | StyleProp<ViewStyle>;
}) {
  // @ts-expect-error
  return <StyledFlatList {...props} className={className} tw={tw} />;
}

export { FlatList };
