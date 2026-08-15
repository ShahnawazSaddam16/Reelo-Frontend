import "./global.css"
import { Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./screens/AuthScreen";
import CreatingProfileScreen from "./screens/ProfileScreens/CreatingProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import { AuthProvider } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator();
 
export default function App() {
  return(
    <>
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthScreen" component={AuthScreen}/>
          <Stack.Screen name="CreatingProfileScreen" component={CreatingProfileScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
    </>
  )
}