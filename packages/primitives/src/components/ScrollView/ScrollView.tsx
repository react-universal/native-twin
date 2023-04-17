import { ScrollView as ReactNativeScrollView } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const ScrollView = styled(
  ReactNativeScrollView,
) as ForwardedStyledComponent<ReactNativeScrollView>;

export default ScrollView;
