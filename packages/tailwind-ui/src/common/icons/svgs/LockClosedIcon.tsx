import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path } from 'react-native-svg';

const LockClosedIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      fill={props.color}
      d='M368,192H352V112a96,96,0,1,0-192,0v80H144a64.07,64.07,0,0,0-64,64V432a64.07,64.07,0,0,0,64,64H368a64.07,64.07,0,0,0,64-64V256A64.07,64.07,0,0,0,368,192Zm-48,0H192V112a64,64,0,1,1,128,0Z'
    />
  </Svg>
);

export default styled(LockClosedIcon);
