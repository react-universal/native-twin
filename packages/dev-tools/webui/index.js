import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
// LoadSkiaWeb().then(async () => {
//   const App = (await import('./App')).default;
//   return registerRootComponent(App);
// });
