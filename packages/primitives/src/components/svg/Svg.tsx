import { styled, ForwardedStyledComponent } from '@universal-labs/styled';
import { Svg as NativeSvg } from 'react-native-svg';

const Svg = styled(NativeSvg) as ForwardedStyledComponent<NativeSvg>;

export { Svg };
