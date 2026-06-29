import { Text as NativeText, View as NativeView } from 'react-native';

export const View = ({ ...props }) => <NativeView {...props} />;

export const Text = ({ ...props }) => <NativeText {...props} />;
