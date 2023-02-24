import { View } from '@medico/universal/view';
import { getSpinnerSize, SpinnerView, SpinnerProps } from './spinner-view';

export const Spinner = ({ size = 'md', ...rest }: SpinnerProps) => {
  return (
    <View
      style={{
        height: getSpinnerSize(size),
        width: getSpinnerSize(size),
      }}
      className='animate-spin'
      accessibilityRole='progressbar'
    >
      <SpinnerView size={size} {...rest} />
    </View>
  );
};
