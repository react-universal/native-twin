import validRNStyles from './validRNStyles';

export const isValidReactNativeStyle = (style: string) => {
  return validRNStyles.some((item) => item === style);
};
