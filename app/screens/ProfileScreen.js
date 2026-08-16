import React from "react";
import { StatusBar, View, Text } from "react-native";
import BottomBar from "../components/App-Shell/BottomBar";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white">Profile</Text>
        <Text className="mt-3 text-sm text-zinc-400">Your account and details</Text>
      </View>
      <BottomBar />
    </View>
  );
}
