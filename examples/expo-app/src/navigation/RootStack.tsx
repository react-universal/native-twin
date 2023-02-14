import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home.screen';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Home'
        options={{
          title: 'Example app',
        }}
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
}

export { RootStack };
