import "./global.css"
import { Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./screens/AuthScreen";

const Stack = createNativeStackNavigator();
 
export default function App() {
  return(
    <>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthScreen" component={AuthScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
    </>
  )
}