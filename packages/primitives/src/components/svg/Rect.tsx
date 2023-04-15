import { styled, ForwardedStyledComponent } from '@universal-labs/styled';
import { Rect as NativeRect } from 'react-native-svg';

const Rect = styled(NativeRect) as ForwardedStyledComponent<NativeRect>;

export { Rect };
