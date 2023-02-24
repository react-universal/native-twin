import 'expo/build/Expo.fx';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

if (process.env.NODE_ENV === 'production') {
  AppRegistry.registerComponent('main', () => App);
} else {
  const { withDevTools } = require('expo/build/launch/withDevTools');
  AppRegistry.registerComponent('main', () => {
    return withDevTools(App);
  });
}
