import { View } from './Primitives';

// Single JSX tag with several utilities that resolve to the same
// declaration (background-color) -> duplicated classNames.
export const Duplicated = () => {
  return <View className='bg-red-500' />;
};
