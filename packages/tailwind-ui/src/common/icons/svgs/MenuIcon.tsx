import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Line } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: title */

const MenuIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Line
      x1={88}
      y1={152}
      x2={424}
      y2={152}
      stroke={props.color}
      strokeLinecap='round'
      strokeMiterlimit={10}
      strokeWidth={48}
    />
    <Line
      x1={88}
      y1={256}
      x2={424}
      y2={256}
      stroke={props.color}
      strokeLinecap='round'
      strokeMiterlimit={10}
      strokeWidth={48}
    />
    <Line
      x1={88}
      y1={360}
      x2={424}
      y2={360}
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeMiterlimit={10}
      strokeWidth={48}
    />
  </Svg>
);

export default styled(MenuIcon);
