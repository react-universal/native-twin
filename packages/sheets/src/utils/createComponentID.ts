import uuid from 'react-native-uuid';

export const createComponentID = () => {
  if (process && process.env['APP_ENV'] === 'test') {
    return 'test';
  }
  return uuid.v4();
};
