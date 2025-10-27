import "./global.css";
import { View, Text } from "react-native";

const ForeignComponent = () => (
  <View className="group-hover:bg-gray-500 h-5">
    <Text className="text(lg white)">asdsad2</Text>
  </View>
);


export default function App() {
  return (
    <View className="hover:bg-red bg-gray-900 group flex-1 items-center justify-center first:bg-green even:text-white">
      <ForeignComponent />
      <Text>sadasd</Text>
    </View>
  );
}
