import { styled } from '@react-universal/core';
import Svg, { SvgProps, Polyline } from 'react-native-svg';

const ChevronDownIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Polyline
      points='112 184 256 328 400 184'
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={48}
    />
  </Svg>
);

export default styled(ChevronDownIcon);
