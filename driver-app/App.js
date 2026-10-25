import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigation from "./src/navigation";

export default function App() {
  return (
    // Required by the bottom sheets in OrdersScreen and OrderDelivery
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Navigation />
        <StatusBar style="auto" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
