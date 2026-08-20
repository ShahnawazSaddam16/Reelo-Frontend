import React from "react";
import { StatusBar, View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../components/App-Shell/BottomBar";
import Stories from "../components/Home/Stories";
import PostCards from "../components/Home/PostCards";

export default function HomeScreen() {

  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <Stories/>
      <View className="flex-1 justify-center items-center">
        <PostCards />
      </View>
      <BottomBar />
    </View>
  );
}