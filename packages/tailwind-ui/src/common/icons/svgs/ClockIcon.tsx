import { styled } from '@react-universal/core';
import Svg, { SvgProps, Path } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: title */

const ClockIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      d='M112.91 128A191.85 191.85 0 0 0 64 254c-1.18 106.35 85.65 193.8 192 194 106.2.2 192-85.83 192-192 0-104.54-83.55-189.61-187.5-192a4.36 4.36 0 0 0-4.5 4.37V152'
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Path
      stroke={props.color}
      fill={props.color}
      d='m233.38 278.63-79-113a8.13 8.13 0 0 1 11.32-11.32l113 79a32.5 32.5 0 0 1-37.25 53.26 33.21 33.21 0 0 1-8.07-7.94Z'
    />
  </Svg>
);

export default styled(ClockIcon);
