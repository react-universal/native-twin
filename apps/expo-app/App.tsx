import "./global.css";
import { styled } from "@native-twin/styled";

const View = styled.View;
const Text = styled.Text;

const ForeignComponent = () => {
  return (
    <View className="hover:bg-gray-500 h-5">
      <Text className="text(lg white)">asdsad2</Text>
    </View>
  );
};

export default function App() {
  return (
    <View className="bg-gray-900 group flex-1 items-center justify-center first:bg-green even:text-white">
      <ForeignComponent />
      <Text>sadasd</Text>
    </View>
  );
}
