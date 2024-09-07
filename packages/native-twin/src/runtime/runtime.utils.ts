export const isDevEnvironment = () => {
  if (typeof __DEV__ === 'undefined') return false;
  return __DEV__;
};
