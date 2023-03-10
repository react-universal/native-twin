import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: title */

const AddUserIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' width={24} height={24} {...props}>
    <Path
      d='M376 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96Z'
      fill='none'
      stroke={props.color}
      strokeWidth={32}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <Path
      d='M288 304c-87 0-175.3 48-191.64 138.6-2 10.92 4.21 21.4 15.65 21.4H464c11.44 0 17.62-10.48 15.65-21.4C463.3 352 375 304 288 304Z'
      fill='none'
      stroke={props.color}
      strokeMiterlimit={10}
      strokeWidth={32}
    />
    <Path
      fill='none'
      stroke={props.color}
      strokeWidth={32}
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M88 176v112M144 232H32'
    />
  </Svg>
);

export default styled(AddUserIcon);
