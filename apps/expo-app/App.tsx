import { useState } from "react";
import "./global.css";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const ForeignComponent = () => {
  return (
    <View className="h-[20vh] hover:bg-gray">
      <Text className="text(lg white)">asdsad2</Text>
    </View>
  );
};

export default function App() {
  const [active, setActive] = useState(false);
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="group bg(gray-900 hover:red) group flex-1 items-center justify-center first:bg-green even:text-white">
          <Pressable
            onPressIn={() => {
              setActive((p) => !p);
            }}
            onPressOut={() => {
              setActive((p) => !p);
            }}
            className="border-1 border-white"
          >
            <Text
              className={`group-hover:bg-pink text(lg white) ${
                active && "text-blue"
              }`}
            >
              Press me
            </Text>
          </Pressable>
          <ForeignComponent />
          <Text className="text-lg">Count</Text>
          <FlatList
            data={[1, 2]}
            renderItem={({ item }) => (
              <View className="bg-gray-200">
                <Text className="text-lg white">Count {item}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
