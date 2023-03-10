import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SendMessageIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      d='m53.12 199.94 400-151.39a8 8 0 0 1 10.33 10.33l-151.39 400a8 8 0 0 1-15-.34l-67.4-166.09a16 16 0 0 0-10.11-10.11L53.46 215a8 8 0 0 1-.34-15.06zM460 52 227 285'
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={32}
    />
  </Svg>
);

export default styled(SendMessageIcon);
