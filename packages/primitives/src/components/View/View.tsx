import { View as ReactNativeView, ViewProps as NativeViewProps } from 'react-native';
import { styled } from '@react-universal/styled';

type ViewProps = Omit<NativeViewProps, 'className'> & {
  className?: string;
};

const View = styled(ReactNativeView);

export type { ViewProps };

export default View;
