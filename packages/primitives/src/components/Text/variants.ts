import { Platform } from 'react-native';

const typographyVariants = {
  default: 'text-base',
  h1: 'text-4xl',
  h2: 'text-3xl',
  h3: 'text-2xl',
  h4: Platform.select({ web: 'text-xl', native: 'text-lg leading-6' }),
  p: 'text-base',
  label: 'text-lg text-primary-50 font-bold',
};

export { typographyVariants };
