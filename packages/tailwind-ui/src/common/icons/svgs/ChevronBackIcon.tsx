import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path } from 'react-native-svg';

const ChevronBackIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      fill='none'
      stroke={props.color}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={48}
      d='M328 112 184 256l144 144'
    />
  </Svg>
);

export default styled(ChevronBackIcon);
