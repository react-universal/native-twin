import { styled } from '@universal-labs/styled';
import Svg, { SvgProps, Path } from 'react-native-svg';

const LoginIcon = (props: SvgProps) => (
  <Svg viewBox='0 0 512 512' {...props}>
    <Path
      fill={props.color}
      d='M392,80H232a56.06,56.06,0,0,0-56,56V240H329.37l-52.68-52.69a16,16,0,0,1,22.62-22.62l80,80a16,16,0,0,1,0,22.62l-80,80a16,16,0,0,1-22.62-22.62L329.37,272H176V376c0,32.05,33.79,56,64,56H392a56.06,56.06,0,0,0,56-56V136A56.06,56.06,0,0,0,392,80Z'
    />
    <Path fill={props.color} d='M80,240a16,16,0,0,0,0,32h96V240Z' />
  </Svg>
);

export default styled(LoginIcon);
