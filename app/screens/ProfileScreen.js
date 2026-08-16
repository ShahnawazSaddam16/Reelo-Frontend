import React from "react";
import { StatusBar, View } from "react-native";
import UserProfile from "../components/Profile/UserProfile";
import BottomBar from "../components/App-Shell/BottomBar";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <UserProfile />
      <BottomBar />
    </View>
  );
}
