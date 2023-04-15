import { Pressable as NativePressable } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const Pressable = styled(NativePressable) as ForwardedStyledComponent<typeof NativePressable>;

export default Pressable;
