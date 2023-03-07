import { styled } from '@universal-labs/core';
import Svg, { SvgProps, Rect, Circle, Path } from 'react-native-svg';

const CalendarIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Rect
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      x={48}
      y={80}
      width={416}
      height={384}
      rx={48}
    />
    <Circle fill={props.color} cx={296} cy={232} r={24} />
    <Circle fill={props.color} cx={376} cy={232} r={24} />
    <Circle fill={props.color} cx={296} cy={312} r={24} />
    <Circle fill={props.color} cx={376} cy={312} r={24} />
    <Circle fill={props.color} cx={136} cy={312} r={24} />
    <Circle fill={props.color} cx={216} cy={312} r={24} />
    <Circle fill={props.color} cx={136} cy={392} r={24} />
    <Circle fill={props.color} cx={216} cy={392} r={24} />
    <Circle fill={props.color} cx={296} cy={392} r={24} />
    <Path
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      strokeLinecap='round'
      d='M128 48v32M384 48v32'
    />
    <Path
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      d='M464 160H48'
    />
  </Svg>
);

export default styled(CalendarIcon);
