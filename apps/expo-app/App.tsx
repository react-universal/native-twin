import { useState } from "react";
import "./global.css";
import { View, Text, FlatList, Pressable } from "react-native";

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
    <View className=" bg(gray-900 hover:red) group flex-1 items-center justify-center first:bg-green even:text-white">
      <ForeignComponent />
      <Pressable
        onPressIn={() => {
          setActive((p) => !p);
        }}
        onPressOut={() => {
          setActive((p) => !p);
        }}
      >
        <Text className={`text(md white) ${active && "text-red"}`}>
          sadasd
        </Text>
      </Pressable>
      <Text className="text-lg text-white">Count</Text>
      <FlatList
        data={[1, 2]}
        renderItem={({ item }) => (
          <View className="bg-gray-200">
            <Text className="text-lg white">Count {item}</Text>
          </View>
        )}
      />
    </View>
  );
}
