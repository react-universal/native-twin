import { useWindowDimensions } from 'react-native';

export const useIsSmallScreen = () => {
  const dimensions = useWindowDimensions().width;
  return dimensions > 0 && dimensions < 350;
};
