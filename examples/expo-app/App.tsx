import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Index } from './src';

// import { enableMapSet } from 'immer';

// enableMapSet();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Index />
    </GestureHandlerRootView>
  );
}
