import '@expo/metro-runtime';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { registerRootComponent } from 'expo';
import App from './App';

LoadSkiaWeb().then(async () => {
  return registerRootComponent(App);
});
