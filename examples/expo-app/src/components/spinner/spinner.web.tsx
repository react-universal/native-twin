import { View } from '@universal-labs/primitives';
import { SpinnerView, SpinnerProps } from './spinner-view';

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
