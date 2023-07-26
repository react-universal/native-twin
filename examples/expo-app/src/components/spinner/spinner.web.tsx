import styled from '@universal-labs/styled';
import { SpinnerView, SpinnerProps } from './spinner-view';

const View = styled.View``;

export const Spinner = ({ ...rest }: SpinnerProps) => {
  return (
    <View
      style={{
        height: 16,
        width: 16,
      }}
      className='animate-spin'
      accessibilityRole='progressbar'
    >
      <SpinnerView {...rest} />
    </View>
  );
};
