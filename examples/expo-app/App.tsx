import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeScreen } from './src/screens/Home.screen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
