import { View as ReactNativeView } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const View = styled(ReactNativeView) as ForwardedStyledComponent<typeof ReactNativeView>;

export default View;
