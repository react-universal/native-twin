import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Rect, Line } from 'react-native-svg';

const CalendarTodayIcon = (props: SvgProps) => (
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
    <Line
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      strokeLinecap='round'
      x1={128}
      y1={48}
      x2={128}
      y2={80}
    />
    <Line
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      strokeLinecap='round'
      x1={384}
      y1={48}
      x2={384}
      y2={80}
    />
    <Rect
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      strokeLinecap='round'
      x={112}
      y={224}
      width={96}
      height={96}
      rx={13}
    />
    <Line
      fill='none'
      stroke={props.color}
      strokeLinejoin='round'
      strokeWidth={32}
      strokeLinecap='round'
      x1={464}
      y1={160}
      x2={48}
      y2={160}
    />
  </Svg>
);

export default styled(CalendarTodayIcon);
