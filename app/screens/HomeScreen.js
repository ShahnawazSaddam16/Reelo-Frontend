import React from "react";
import { StatusBar, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../components/App-Shell/BottomBar";
import { useAuth } from "../../contexts/AuthContext";
import Stories from "../components/Home/Stories";

export default function HomeScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      routes: [{ name: "AuthScreen" }],
    });
  };

  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <Stories/>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white">Home</Text>
      </View>
      <BottomBar />
    </View>
  );
}