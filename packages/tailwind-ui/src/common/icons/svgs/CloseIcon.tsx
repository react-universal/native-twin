import { styled } from '@universal-labs/core';
import Svg, { SvgProps, Path } from 'react-native-svg';

const CloseIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      stroke={props.color}
      fill={props.color}
      d='m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34Z'
    />
  </Svg>
);

export default styled(CloseIcon);
