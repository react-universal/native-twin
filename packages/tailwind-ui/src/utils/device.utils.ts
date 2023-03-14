import { Dimensions, Platform } from 'react-native';

export const getDeviceDimensions = () => {
  const { width, height } = Dimensions.get(
    Platform.OS === 'web' || Platform.OS === 'ios' ? 'screen' : 'screen',
  );
  return {
    DEVICE_HEIGHT: height,
    DEVICE_WIDTH: width,
  };
};
