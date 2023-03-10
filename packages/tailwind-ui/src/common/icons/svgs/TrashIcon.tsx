import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path, Line } from 'react-native-svg';

const TrashIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      d='M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320'
      fill={'none'}
      stroke={props.color}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      strokeWidth={32}
    />
    <Line
      x1={80}
      y1={112}
      x2={432}
      y2={112}
      fill={'none'}
      stroke={props.color}
      strokeLinecap={'round'}
      strokeWidth={32}
      strokeMiterlimit={10}
    />
    <Path
      d='M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40'
      fill={'none'}
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={256}
      y1={176}
      x2={256}
      y2={400}
      fill={'none'}
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={184}
      y1={176}
      x2={192}
      y2={400}
      fill={'none'}
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
    <Line
      x1={328}
      y1={176}
      x2={320}
      y2={400}
      fill={'none'}
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
  </Svg>
);

export default styled(TrashIcon);
