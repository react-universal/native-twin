import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Line, Path, Circle } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: title */

const ListIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Line
      x1={224}
      y1={184}
      x2={352}
      y2={184}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={224}
      y1={256}
      x2={352}
      y2={256}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={224}
      y1={327}
      x2={352}
      y2={327}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Path
      d='M448,258c0-106-86-192-192-192S64,152,64,258s86,192,192,192S448,364,448,258Z'
      fill='none'
      stroke={props.color}
      strokeWidth={32}
      strokeMiterlimit={10}
    />
    <Circle
      cx={168}
      cy={184}
      r={8}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Circle
      cx={168}
      cy={257}
      r={8}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Circle
      cx={168}
      cy={328}
      r={8}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
  </Svg>
);

export default styled(ListIcon);
