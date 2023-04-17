/// <reference types="react" />
import { FlatListProps, StyleProp, ViewStyle } from 'react-native';
declare function FlatList<TItems>({ className, tw, ...props }: Omit<FlatListProps<TItems>, 'contentContainerStyle'> & {
    className?: string;
    tw?: string;
    contentContainerStyle?: string | StyleProp<ViewStyle>;
}): JSX.Element;
export { FlatList };
