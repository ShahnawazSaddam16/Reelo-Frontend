import React from "react";
import { StatusBar, View } from "react-native";
import MyProfile from "../../components/Profile/MyProfile";
import BottomBar from "../../components/App-Shell/BottomBar";
import ManagingPosts from "../../components/Profile/ManagingPosts";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <MyProfile />
      <BottomBar />
    </View>
  );
}
