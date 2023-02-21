import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen } from '../screens/Home.screen';
import { PrimitivesStack } from './PrimitivesStack';

const Stack = createDrawerNavigator();

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Home'
        options={{
          title: 'Dashboard',
        }}
        component={HomeScreen}
      />
      <Stack.Screen
        name='Primitives'
        options={{
          title: 'Primitives',
        }}
        component={PrimitivesStack}
      />
    </Stack.Navigator>
  );
}

export { RootStack };
