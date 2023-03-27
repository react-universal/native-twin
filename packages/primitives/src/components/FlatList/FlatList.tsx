import { FlatList as NativeFlatList } from 'react-native';
import { styled } from '@universal-labs/styled';

const FlatList = styled(NativeFlatList, {
  props: { contentContainerStyle: true },
});

// function FlatList<TItems>({
//   className,
//   tw,
//   ...props
// }: ComponentProps<typeof NativeFlatList<TItems>> & { className?: string; tw?: string }) {
//   // @ts-expect-error
//   return <StyledFlatList {...props} className={className} tw={tw} />;
//   // <NativeFlatList<TItems> {...props} />;
//   // return <StyledFlatList {...props} data={[{ a: 1 }]} />;
// }

export { FlatList };
