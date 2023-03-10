import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path } from 'react-native-svg';

const CheckBoxFilledIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 24 24' {...props}>
    <Path
      fill={props.color}
      d='M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,5V19H5V5H19M10,17L6,13L7.41,11.58L10,14.17L16.59,7.58L18,9'
    />
  </Svg>
);

export default styled(CheckBoxFilledIcon);
