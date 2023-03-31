import uuid from 'react-native-uuid';

export const createComponentID = () => {
  if (process && process.env['NODE_ENV'] === 'test') {
    return 'test-parent';
  }
  return uuid.v4();
};
