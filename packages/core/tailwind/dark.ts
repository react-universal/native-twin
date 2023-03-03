import type { CustomPluginFunction } from './types';

export const dark: CustomPluginFunction = ({ addVariant }) => {
  addVariant('dark', '&::dark');
};
