import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';

const FirstRoute = () => <View className='flex-1 bg-blue-200 border-8 border-white' style={{ flex: 1 }} />;

const SecondRoute = () => <View style={{ flex: 1, backgroundColor: '#673ab7' }} />;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

export function TabViewExample() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}
