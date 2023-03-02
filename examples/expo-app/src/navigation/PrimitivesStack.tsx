import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PrimitivesScreen } from '../screens/Buttons.screen';

const Stack = createNativeStackNavigator();

function PrimitivesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='List'
        options={{
          title: 'List',
        }}
        component={PrimitivesScreen}
      />
    </Stack.Navigator>
  );
}

export { PrimitivesStack };
