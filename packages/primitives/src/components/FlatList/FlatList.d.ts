import type { FlatListProps } from 'react-native';

export declare const FlatList: <TItems>({
  className,
  tw,
  ...props
}: FlatListProps<TItems> & {
  className?: string;
  tw?: string;
  contentContainerStyle?: string;
}) => JSX.Element;
