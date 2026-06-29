// @ts-noCheck
import { FlatList, View } from "react-native";
import { Button } from "./code-i";

export default function App() {
  return (
    <View
      className={`group ${x ? 'asd' : 'x'} h-[20vh] flex-1 hover:bg-red shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200`}
    >
      <Button size="small" />
      <FlatList
        data={[1, 2]}
        renderItem={({ item }) => (
          <View className="bg-gray-200">
            <Text className="text-lg white">Count {item}</Text>
          </View>
        )}
      />
      <Text className="px-2 group-hover:bg-green">Hello World</Text>
    </View>
  );
}
