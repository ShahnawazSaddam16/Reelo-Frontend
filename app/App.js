import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./screens/AuthScreen";
import CreatingProfileScreen from "./screens/ProfileScreens/CreatingProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreens/ProfileScreen";
import CreatePostScreen from "./screens/BlogScreens/CreatePostScreen";
import SearchScreen from "./screens/SearchScreen";
import { AuthProvider } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="CreatingProfileScreen" component={CreatingProfileScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}