import { styled } from '@react-universal/core';
import Svg, { SvgProps, Path, Line } from 'react-native-svg';

const MapIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      d='M313.27,124.64,198.73,51.36a32,32,0,0,0-29.28.35L56.51,127.49A16,16,0,0,0,48,141.63v295.8a16,16,0,0,0,23.49,14.14l97.82-63.79a32,32,0,0,1,29.5-.24l111.86,73a32,32,0,0,0,29.27-.11l115.43-75.94a16,16,0,0,0,8.63-14.2V74.57a16,16,0,0,0-23.49-14.14l-98,63.86A32,32,0,0,1,313.27,124.64Z'
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={328}
      y1={128}
      x2={328}
      y2={464}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={184}
      y1={48}
      x2={184}
      y2={384}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
  </Svg>
);

export default styled(MapIcon);
